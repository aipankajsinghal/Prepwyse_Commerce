import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

// GET: Get study sessions (filtered by date range or plan)
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const completed = searchParams.get('completed');

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query filters
    const where: any = {};
    
    if (planId) {
      where.planId = planId;
    } else {
      // Get all plans for this user
      const plans = await prisma.studyPlan.findMany({
        where: { userId: user.id, isActive: true },
        select: { id: true },
      });
      where.planId = { in: plans.map((p) => p.id) };
    }

    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (completed !== null) {
      where.completed = completed === 'true';
    }

    const sessions = await prisma.studySession.findMany({
      where,
      include: {
        plan: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json({
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study sessions' },
      { status: 500 }
    );
  }
}

// PATCH: Update session (mark as completed, add notes)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, completed, notes } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const session = await prisma.studySession.findUnique({
      where: { id: sessionId },
      include: {
        plan: {
          select: { userId: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user || session.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update session
    const updateData: any = {};
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completedAt = new Date();
      }
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedSession = await prisma.studySession.update({
      where: { id: sessionId },
      data: updateData,
    });

    // Award points for completing session
    if (completed && !session.completed) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          points: { increment: 30 },
        },
      });
    }

    return NextResponse.json({
      session: updatedSession,
      message: 'Session updated successfully',
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
