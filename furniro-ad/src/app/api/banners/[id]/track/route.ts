import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/models/Banner';

// POST /api/banners/[id]/track - Track banner performance
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { type } = body; // 'click' or 'impression'

    if (!type || !['click', 'impression'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tracking type. Must be "click" or "impression"' },
        { status: 400 }
      );
    }

    const banner = await Banner.findById(params.id);
    
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Update performance metrics
    const updateField = type === 'click' 
      ? { $inc: { clicks: 1 } } 
      : { $inc: { impressions: 1 } };

    const updatedBanner = await Banner.findByIdAndUpdate(
      params.id,
      updateField,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        bannerId: params.id,
        type,
        clicks: updatedBanner?.clicks,
        impressions: updatedBanner?.impressions,
        clickThroughRate: updatedBanner?.clickThroughRate
      },
      message: `${type} tracked successfully`
    });

  } catch (error) {
    console.error('Error tracking banner performance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track banner performance' },
      { status: 500 }
    );
  }
}
