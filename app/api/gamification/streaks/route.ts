import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

// GET: Get user's streak information
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActivityDate: user.lastActivityDate,
      isActiveToday: isActiveToday(user.lastActivityDate),
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    );
  }
}

// POST: Update streak (called when user completes an activity)
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActivity = user.lastActivityDate 
      ? new Date(user.lastActivityDate.getFullYear(), user.lastActivityDate.getMonth(), user.lastActivityDate.getDate())
      : null;

    let newStreak = user.currentStreak;
    let streakIncreased = false;

    if (!lastActivity) {
      // First activity ever
      newStreak = 1;
      streakIncreased = true;
    } else {
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Already active today, no change
        newStreak = user.currentStreak;
      } else if (daysDiff === 1) {
        // Consecutive day
        newStreak = user.currentStreak + 1;
        streakIncreased = true;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    const newLongestStreak = Math.max(user.longestStreak, newStreak);
    const longestStreakBroken = newLongestStreak > user.longestStreak;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: now,
      },
    });

    // Award points for streak milestones
    if (streakIncreased) {
      const points = calculateStreakPoints(newStreak);
      if (points > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            points: { increment: points },
          },
        });
      }

      // Award streak achievements
      await checkStreakAchievements(user.id, newStreak);
    }

    // Award achievement for breaking longest streak record
    if (longestStreakBroken && newLongestStreak >= 7) {
      await awardAchievement(
        user.id,
        'streak',
        `${newLongestStreak}-Day Streak Record`,
        `New personal record! ${newLongestStreak} consecutive days of learning.`,
        '🔥',
        'streak',
        newLongestStreak * 10
      );
    }

    return NextResponse.json({
      currentStreak: updatedUser.currentStreak,
      longestStreak: updatedUser.longestStreak,
      lastActivityDate: updatedUser.lastActivityDate,
      streakIncreased,
      longestStreakBroken,
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    );
  }
}

function isActiveToday(lastActivityDate: Date | null): boolean {
  if (!lastActivityDate) return false;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActivity = new Date(
    lastActivityDate.getFullYear(),
    lastActivityDate.getMonth(),
    lastActivityDate.getDate()
  );
  
  return today.getTime() === lastActivity.getTime();
}

function calculateStreakPoints(streak: number): number {
  // Reward more points for longer streaks
  if (streak === 3) return 20;
  if (streak === 7) return 50;
  if (streak === 14) return 100;
  if (streak === 30) return 250;
  if (streak === 60) return 500;
  if (streak === 100) return 1000;
  if (streak % 10 === 0) return 30; // Every 10 days
  return 0;
}

async function checkStreakAchievements(userId: string, streak: number) {
  const milestones = [
    { days: 3, name: '3-Day Streak', icon: '🔥' },
    { days: 7, name: 'Week Warrior', icon: '⚡' },
    { days: 14, name: 'Two-Week Champion', icon: '💪' },
    { days: 30, name: 'Monthly Master', icon: '🌟' },
    { days: 60, name: 'Two-Month Legend', icon: '👑' },
    { days: 100, name: 'Century Club', icon: '💯' },
  ];

  for (const milestone of milestones) {
    if (streak === milestone.days) {
      await awardAchievement(
        userId,
        'streak',
        milestone.name,
        `Completed ${milestone.days} consecutive days of learning!`,
        milestone.icon,
        'streak',
        milestone.days * 10
      );
    }
  }
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
