import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET: Get flashcards by chapter
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const subjectId = searchParams.get('subjectId');

    if (!chapterId && !subjectId) {
      return NextResponse.json(
        { error: 'Chapter ID or Subject ID is required' },
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

    // Build query
    const where: any = {};
    if (chapterId) {
      where.chapterId = chapterId;
    } else if (subjectId) {
      const chapters = await prisma.chapter.findMany({
        where: { subjectId },
        select: { id: true },
      });
      where.chapterId = { in: chapters.map((c) => c.id) };
    }

    const flashcards = await prisma.flashcard.findMany({
      where,
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
        progress: {
          where: { userId: user.id },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      flashcards: flashcards.map((card) => ({
        ...card,
        userProgress: card.progress[0] || null,
        progress: undefined, // Remove the array from response
      })),
      total: flashcards.length,
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}

// POST: Create flashcard (admin or AI-generated)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chapterId, front, back, difficulty, tags } = await request.json();

    if (!chapterId || !front || !back) {
      return NextResponse.json(
        { error: 'Chapter ID, front, and back are required' },
        { status: 400 }
      );
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        chapterId,
        front,
        back,
        difficulty: difficulty || 'medium',
        tags: tags || null,
      },
    });

    return NextResponse.json({
      flashcard,
      message: 'Flashcard created successfully',
    });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: 500 }
    );
  }
}
