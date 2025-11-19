import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, unauthorizedError, notFoundError, validationError } from '@/lib/api-error-handler';

// GET: Get user personalization preferences
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return unauthorizedError();
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
      return notFoundError('User not found');
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
    return handleApiError(error, 'Failed to fetch personalization');
  }
}

// PATCH: Update user personalization preferences
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return unauthorizedError();
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
        return validationError('Invalid language');
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
    return handleApiError(error, 'Failed to update personalization');
  }
}
