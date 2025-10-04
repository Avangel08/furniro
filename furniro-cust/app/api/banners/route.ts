import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/models/Banner';

// GET /api/banners - Get active banners for customer frontend
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const status = searchParams.get('status') || 'Active';
    const limit = parseInt(searchParams.get('limit') || '10');

    const filter: any = {
      status: status,
      isActive: true
    };

    if (position && position !== 'all') {
      filter.position = position;
    }

    // Only get banners that are currently active based on date range
    const now = new Date();
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };

    const banners = await Banner.find(filter)
      .sort({ priority: 1, createdAt: -1 })
      .limit(limit)
      .select('title imageUrl linkUrl altText type position status startDate endDate priority')
      .lean();

    return NextResponse.json({
      success: true,
      data: banners,
      count: banners.length
    });

  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}
