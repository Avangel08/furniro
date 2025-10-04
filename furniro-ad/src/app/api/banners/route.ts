import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/models/Banner';

// GET /api/banners - Get all banners with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const position = searchParams.get('position');
    const search = searchParams.get('search');

    // Build filter object
    const filter: any = {};
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (position && position !== 'all') {
      filter.position = position;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { altText: { $regex: search, $options: 'i' } },
        { targetAudience: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get banners with pagination
    const banners = await Banner.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Banner.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: banners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST /api/banners - Create new banner
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'type', 'position', 'imageUrl', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    if (endDate <= startDate) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Create new banner
    const banner = new Banner({
      title: body.title,
      type: body.type,
      position: body.position,
      status: body.status || 'Draft',
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl || undefined,
      altText: body.altText || undefined,
      startDate: startDate,
      endDate: endDate,
      isActive: body.isActive !== undefined ? body.isActive : true,
      priority: body.priority || 1,
      targetAudience: body.targetAudience || undefined,
      clicks: 0,
      impressions: 0
    });

    await banner.save();

    return NextResponse.json({
      success: true,
      data: banner,
      message: 'Banner created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating banner:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
