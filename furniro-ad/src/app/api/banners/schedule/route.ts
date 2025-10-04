import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import { BannerScheduler } from '@/services/bannerScheduler';

// POST /api/banners/schedule - Update banner statuses based on dates
export async function POST(request: NextRequest) {
  try {
    await authMiddleware(request, ['admin', 'manager']);

    const results = await BannerScheduler.updateBannerStatuses();

    return NextResponse.json({
      success: true,
      data: results,
      message: `Banner scheduling completed. Activated: ${results.activated}, Deactivated: ${results.deactivated}, Scheduled: ${results.scheduled}`
    });

  } catch (error: any) {
    console.error('Error in banner scheduling:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update banner schedules' },
      { status: error.statusCode || 500 }
    );
  }
}

// GET /api/banners/schedule - Get scheduling statistics and banners needing attention
export async function GET(request: NextRequest) {
  try {
    await authMiddleware(request, ['admin', 'manager', 'staff']);

    const [stats, attentionBanners] = await Promise.all([
      BannerScheduler.getSchedulingStats(),
      BannerScheduler.getBannersNeedingAttention()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        attentionBanners
      }
    });

  } catch (error: any) {
    console.error('Error getting scheduling info:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get scheduling information' },
      { status: error.statusCode || 500 }
    );
  }
}
