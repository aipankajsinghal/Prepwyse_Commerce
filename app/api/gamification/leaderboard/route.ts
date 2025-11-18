import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

// GET: Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all_time'; // daily, weekly, monthly, all_time
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get current period key
    const now = new Date();
    let periodKey = 'all';
    
    if (period === 'daily') {
      periodKey = now.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      periodKey = `${now.getFullYear()}-W${getWeekNumber(now)}`;
    } else if (period === 'monthly') {
      periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // Get leaderboard entries
    const entries = await prisma.leaderboard.findMany({
      where: { period, periodKey },
      orderBy: [{ points: 'desc' }, { updatedAt: 'asc' }],
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            grade: true,
            level: true,
            clerkId: true,
          },
        },
      },
    });

    // Update ranks if needed
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].rank !== i + 1) {
        await prisma.leaderboard.update({
          where: { id: entries[i].id },
          data: { rank: i + 1 },
        });
        entries[i].rank = i + 1;
      }
    }

    // Get current user's rank
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    let userRank = null;
    if (currentUser) {
      const userEntry = await prisma.leaderboard.findUnique({
        where: {
          userId_period_periodKey: {
            userId: currentUser.id,
            period,
            periodKey,
          },
        },
      });
      userRank = userEntry?.rank || null;
    }

    return NextResponse.json({
      period,
      periodKey,
      entries: entries.map((entry) => ({
        rank: entry.rank,
        points: entry.points,
        name: entry.user.name || 'Anonymous',
        grade: entry.user.grade,
        level: entry.user.level,
        isCurrentUser: entry.user.clerkId === userId,
      })),
      userRank,
      total: entries.length,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
