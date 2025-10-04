import { NextRequest, NextResponse } from 'next/server';
import { BannerScheduler } from '@/services/bannerScheduler';

// POST /api/cron/banner-schedule - Cron job endpoint for banner scheduling
export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = await BannerScheduler.updateBannerStatuses();

    return NextResponse.json({
      success: true,
      data: results,
      message: `Banner scheduling completed. Activated: ${results.activated}, Deactivated: ${results.deactivated}, Scheduled: ${results.scheduled}`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in banner scheduling cron job:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update banner schedules' },
      { status: 500 }
    );
  }
}

// GET /api/cron/banner-schedule - Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Banner scheduling cron endpoint is healthy',
    timestamp: new Date().toISOString()
  });
}
