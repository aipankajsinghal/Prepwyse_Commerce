import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET: Get user's current points and level
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        points: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      points: user.points,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActivityDate: user.lastActivityDate,
      nextLevelPoints: calculateNextLevelPoints(user.level),
      progressToNextLevel: calculateProgressToNextLevel(user.points, user.level),
    });
  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points' },
      { status: 500 }
    );
  }
}

// POST: Award points to user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { points, reason } = await request.json();

    if (!points || points <= 0) {
      return NextResponse.json(
        { error: 'Invalid points value' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, points: true, level: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newPoints = user.points + points;
    const newLevel = calculateLevel(newPoints);
    const leveledUp = newLevel > user.level;

    // Update user points and level
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        points: newPoints,
        level: newLevel,
      },
    });

    // Update leaderboards
    await updateLeaderboards(user.id, newPoints);

    // If leveled up, award achievement
    if (leveledUp) {
      await awardAchievement(user.id, 'milestone', `Level ${newLevel} Achieved`, 
        `Congratulations! You've reached level ${newLevel}!`, 
        '🎖️', 'study', 50);
    }

    return NextResponse.json({
      points: updatedUser.points,
      level: updatedUser.level,
      leveledUp,
      reason,
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Failed to award points' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateLevel(points: number): number {
  // Level formula: level = floor(sqrt(points / 100)) + 1
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

function calculateNextLevelPoints(currentLevel: number): number {
  // Points needed for next level
  return Math.pow(currentLevel, 2) * 100;
}

function calculateProgressToNextLevel(currentPoints: number, currentLevel: number): number {
  const currentLevelPoints = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelPoints = calculateNextLevelPoints(currentLevel);
  const progress = ((currentPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
  return Math.max(0, Math.min(100, progress));
}

async function updateLeaderboards(userId: string, points: number) {
  const now = new Date();
  const periods = [
    { period: 'daily', periodKey: now.toISOString().split('T')[0] },
    { period: 'weekly', periodKey: `${now.getFullYear()}-W${getWeekNumber(now)}` },
    { period: 'monthly', periodKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
    { period: 'all_time', periodKey: 'all' },
  ];

  for (const { period, periodKey } of periods) {
    await prisma.leaderboard.upsert({
      where: {
        userId_period_periodKey: { userId, period, periodKey },
      },
      update: {
        points,
        rank: 0, // Will be calculated separately
      },
      create: {
        userId,
        period,
        periodKey,
        points,
        rank: 0,
      },
    });
  }

  // Update ranks for each period
  for (const { period, periodKey } of periods) {
    const entries = await prisma.leaderboard.findMany({
      where: { period, periodKey },
      orderBy: { points: 'desc' },
    });

    for (let i = 0; i < entries.length; i++) {
      await prisma.leaderboard.update({
        where: { id: entries[i].id },
        data: { rank: i + 1 },
      });
    }
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

async function awardAchievement(
  userId: string,
  type: string,
  name: string,
  description: string,
  icon: string,
  category: string,
  points: number
) {
  // Check if achievement already exists
  const existing = await prisma.achievement.findFirst({
    where: { userId, name },
  });

  if (!existing) {
    await prisma.achievement.create({
      data: {
        userId,
        type,
        name,
        description,
        icon,
        category,
        points,
      },
    });
  }
}
