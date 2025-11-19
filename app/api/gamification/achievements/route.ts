import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, unauthorizedError, notFoundError, validationError } from '@/lib/api-error-handler';

// GET: Get user's achievements
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return unauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return notFoundError('User not found');
    }

    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: 'desc' },
    });

    // Group by category
    const grouped = achievements.reduce((acc: any, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {});

    return NextResponse.json({
      achievements,
      grouped,
      total: achievements.length,
      totalPoints: achievements.reduce((sum, a) => sum + a.points, 0),
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch achievements');
  }
}

// POST: Award achievement to user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, name, description, icon, category, points } = await request.json();

    if (!type || !name || !description || !icon || !category) {
      return validationError('Missing required fields');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return notFoundError('User not found');
    }

    // Check if achievement already exists
    const existing = await prisma.achievement.findFirst({
      where: { userId: user.id, name },
    });

    if (existing) {
      return validationError('Achievement already unlocked');
    }

    // Create achievement
    const achievement = await prisma.achievement.create({
      data: {
        userId: user.id,
        type,
        name,
        description,
        icon,
        category,
        points: points || 0,
      },
    });

    // Award points to user
    if (points && points > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          points: { increment: points },
        },
      });
    }

    return NextResponse.json({
      achievement,
      message: `Achievement unlocked: ${name}`,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to award achievement');
  }
}
