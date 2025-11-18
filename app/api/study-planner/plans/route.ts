import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

// GET: Get user's study plans
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plans = await prisma.studyPlan.findMany({
      where: { userId: user.id },
      include: {
        sessions: {
          orderBy: { scheduledDate: 'asc' },
          take: 5, // Get next 5 sessions
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      plans,
      total: plans.length,
    });
  } catch (error) {
    console.error('Error fetching study plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study plans' },
      { status: 500 }
    );
  }
}

// POST: Create a new study plan
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      description,
      examDate,
      targetScore,
      weeklyHours,
      preferredTime,
      subjectIds,
    } = await request.json();

    if (!title || !weeklyHours) {
      return NextResponse.json(
        { error: 'Title and weekly hours are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, weakAreas: true, strongAreas: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create study plan
    const plan = await prisma.studyPlan.create({
      data: {
        userId: user.id,
        title,
        description,
        examDate: examDate ? new Date(examDate) : null,
        targetScore,
        weeklyHours,
        preferredTime,
      },
    });

    // Generate study sessions based on user's weak areas and available time
    const sessions = await generateStudySessions(
      plan.id,
      weeklyHours,
      subjectIds || [],
      user.weakAreas as any,
      examDate ? new Date(examDate) : null
    );

    return NextResponse.json({
      plan: {
        ...plan,
        sessions,
      },
      message: 'Study plan created successfully',
    });
  } catch (error) {
    console.error('Error creating study plan:', error);
    return NextResponse.json(
      { error: 'Failed to create study plan' },
      { status: 500 }
    );
  }
}

// Helper function to generate study sessions
async function generateStudySessions(
  planId: string,
  weeklyHours: number,
  subjectIds: string[],
  weakAreas: any,
  examDate: Date | null
): Promise<any[]> {
  const sessions: any[] = [];
  const now = new Date();
  const daysUntilExam = examDate
    ? Math.floor((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 90; // Default 90 days

  // Get chapters to study
  const chapters = await prisma.chapter.findMany({
    where: subjectIds.length > 0 ? { subjectId: { in: subjectIds } } : {},
    include: { subject: true },
    orderBy: { order: 'asc' },
  });

  // Distribute hours across days
  const sessionsPerWeek = Math.ceil(weeklyHours / 1.5); // Assuming 1.5 hours per session
  const totalSessions = Math.min(chapters.length * 2, Math.ceil((daysUntilExam / 7) * sessionsPerWeek));
  
  // Create sessions
  let sessionDate = new Date(now);
  sessionDate.setDate(sessionDate.getDate() + 1); // Start tomorrow

  for (let i = 0; i < totalSessions && i < chapters.length * 2; i++) {
    const chapter = chapters[i % chapters.length];
    const isRevision = i >= chapters.length;

    const session = await prisma.studySession.create({
      data: {
        planId,
        chapterId: chapter.id,
        title: isRevision
          ? `Revision: ${chapter.name}`
          : `Study: ${chapter.name}`,
        description: `${chapter.subject.name} - ${chapter.name}`,
        type: isRevision ? 'revision' : 'quiz',
        scheduledDate: new Date(sessionDate),
        duration: 90, // 90 minutes
      },
    });

    sessions.push(session);

    // Increment date (skip weekends, space out sessions)
    do {
      sessionDate.setDate(sessionDate.getDate() + 1);
    } while (sessionDate.getDay() === 0 || sessionDate.getDay() === 6);
  }

  return sessions;
}
