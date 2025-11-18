import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

// GET: Get flashcards due for review
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();

    // Get flashcards due for review
    const where: any = {
      userId: user.id,
      nextReviewDate: { lte: now },
    };

    if (chapterId) {
      where.flashcard = {
        chapterId,
      };
    }

    const progress = await prisma.flashcardProgress.findMany({
      where,
      include: {
        flashcard: {
          include: {
            chapter: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: { nextReviewDate: 'asc' },
      take: limit,
    });

    // Also get new cards (never reviewed)
    const reviewedCardIds = progress.map((p) => p.flashcardId);
    const newCardsWhere: any = {
      id: { notIn: reviewedCardIds },
    };

    if (chapterId) {
      newCardsWhere.chapterId = chapterId;
    }

    const newCards = await prisma.flashcard.findMany({
      where: newCardsWhere,
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
      },
      take: Math.max(0, limit - progress.length),
    });

    return NextResponse.json({
      dueForReview: progress.map((p) => ({
        ...p.flashcard,
        progress: {
          easeFactor: p.easeFactor,
          interval: p.interval,
          repetitions: p.repetitions,
          nextReviewDate: p.nextReviewDate,
          lastReviewedAt: p.lastReviewedAt,
          reviewCount: p.reviewCount,
        },
      })),
      newCards,
      total: progress.length + newCards.length,
    });
  } catch (error) {
    console.error('Error fetching review flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review flashcards' },
      { status: 500 }
    );
  }
}

// POST: Submit flashcard review (SM-2 algorithm)
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flashcardId, quality } = await request.json();

    if (!flashcardId || quality === undefined || quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: 'Flashcard ID and quality (0-5) are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create progress
    let progress = await prisma.flashcardProgress.findUnique({
      where: {
        userId_flashcardId: { userId: user.id, flashcardId },
      },
    });

    if (!progress) {
      progress = await prisma.flashcardProgress.create({
        data: {
          userId: user.id,
          flashcardId,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date(),
        },
      });
    }

    // SM-2 Algorithm
    const { easeFactor, interval, repetitions, nextReviewDate } = calculateSM2(
      quality,
      progress.easeFactor,
      progress.interval,
      progress.repetitions
    );

    // Update progress
    const updatedProgress = await prisma.flashcardProgress.update({
      where: { id: progress.id },
      data: {
        easeFactor,
        interval,
        repetitions,
        nextReviewDate,
        lastReviewedAt: new Date(),
        quality,
        reviewCount: { increment: 1 },
      },
    });

    // Award points
    const points = quality >= 3 ? 5 : 2;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: points },
      },
    });

    return NextResponse.json({
      progress: updatedProgress,
      points,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// SM-2 Algorithm implementation
function calculateSM2(
  quality: number,
  easeFactor: number,
  interval: number,
  repetitions: number
): {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
} {
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // Update interval and repetitions
  if (quality < 3) {
    // Failed: reset
    newRepetitions = 0;
    newInterval = 0;
  } else {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  // Calculate next review date
  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
  };
}
