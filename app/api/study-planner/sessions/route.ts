import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, unauthorizedError, notFoundError, validationError, forbiddenError } from '@/lib/api-error-handler';

// GET: Get study sessions (filtered by date range or plan)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const completed = searchParams.get('completed');

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) return notFoundError('User not found');

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
    return handleApiError(error, 'Failed to fetch study sessions');
  }
}

// PATCH: Update session (mark as completed, add notes)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) return unauthorizedError();

    const { sessionId, completed, notes } = await request.json();

    if (!sessionId) {
      return validationError('Session ID is required');
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

    if (!session) return notFoundError('Session not found');

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user || session.plan.userId !== user.id) {
      return forbiddenError('Unauthorized to update this session');
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
    return handleApiError(error, 'Failed to update session');
  }
}
