import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/models/Banner';

// POST /api/banners/track - Track banner performance
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { bannerId, type } = await request.json();

    if (!bannerId || !type) {
      return NextResponse.json(
        { success: false, error: 'Banner ID and type are required' },
        { status: 400 }
      );
    }

    if (!['click', 'impression'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tracking type. Must be "click" or "impression"' },
        { status: 400 }
      );
    }

    // Find and update banner
    const updateField = type === 'click' ? 'clicks' : 'impressions';
    const banner = await Banner.findByIdAndUpdate(
      bannerId,
      { $inc: { [updateField]: 1 } },
      { new: true }
    ).lean();

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        bannerId,
        type,
        [updateField]: banner[updateField],
        clickThroughRate: banner.impressions > 0 
          ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
          : '0.00'
      },
      message: `Banner ${type} tracked successfully`
    });

  } catch (error: any) {
    console.error('Error tracking banner:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to track banner' },
      { status: 500 }
    );
  }
}
