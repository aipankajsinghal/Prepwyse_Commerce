import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

// GET: Get user personalization preferences
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        preferredLanguage: true,
        favoriteSubjects: true,
        favoriteChapters: true,
        dashboardLayout: true,
        notificationPrefs: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      preferredLanguage: user.preferredLanguage,
      favoriteSubjects: user.favoriteSubjects || [],
      favoriteChapters: user.favoriteChapters || [],
      dashboardLayout: user.dashboardLayout || { widgets: [] },
      notificationPrefs: user.notificationPrefs || {
        email: true,
        push: true,
        studyReminders: true,
        achievements: true,
        weeklyReport: true,
      },
    });
  } catch (error) {
    console.error('Error fetching personalization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalization' },
      { status: 500 }
    );
  }
}

// PATCH: Update user personalization preferences
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      preferredLanguage,
      favoriteSubjects,
      favoriteChapters,
      dashboardLayout,
      notificationPrefs,
    } = await request.json();

    const updateData: any = {};
    
    if (preferredLanguage !== undefined) {
      if (!['en', 'hi'].includes(preferredLanguage)) {
        return NextResponse.json(
          { error: 'Invalid language' },
          { status: 400 }
        );
      }
      updateData.preferredLanguage = preferredLanguage;
    }

    if (favoriteSubjects !== undefined) {
      updateData.favoriteSubjects = favoriteSubjects;
    }

    if (favoriteChapters !== undefined) {
      updateData.favoriteChapters = favoriteChapters;
    }

    if (dashboardLayout !== undefined) {
      updateData.dashboardLayout = dashboardLayout;
    }

    if (notificationPrefs !== undefined) {
      updateData.notificationPrefs = notificationPrefs;
    }

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: updateData,
    });

    return NextResponse.json({
      preferredLanguage: user.preferredLanguage,
      favoriteSubjects: user.favoriteSubjects,
      favoriteChapters: user.favoriteChapters,
      dashboardLayout: user.dashboardLayout,
      notificationPrefs: user.notificationPrefs,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating personalization:', error);
    return NextResponse.json(
      { error: 'Failed to update personalization' },
      { status: 500 }
    );
  }
}
