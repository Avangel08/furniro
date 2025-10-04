import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/models/Banner';

// GET /api/banners/[id] - Get single banner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const banner = await Banner.findById(params.id);
    
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: banner
    });

  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

// PUT /api/banners/[id] - Update banner
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Check if banner exists
    const existingBanner = await Banner.findById(params.id);
    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Validate dates if provided
    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      
      if (endDate <= startDate) {
        return NextResponse.json(
          { success: false, error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl;
    if (body.altText !== undefined) updateData.altText = body.altText;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.targetAudience !== undefined) updateData.targetAudience = body.targetAudience;

    const banner = await Banner.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: banner,
      message: 'Banner updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating banner:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE /api/banners/[id] - Delete banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const banner = await Banner.findById(params.id);
    
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    await Banner.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
