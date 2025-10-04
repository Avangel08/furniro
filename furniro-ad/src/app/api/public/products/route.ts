import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/public/products - Get all active products for customer site
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '16');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest'; // default, price-low, price-high, name, newest

    // Build filter object - only show active products
    const filter: any = {
      status: 'Active' // Only show active products to customers (case-sensitive)
    };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sortObj: any = {};
    switch (sortBy) {
      case 'price-low':
        sortObj = { price: 1 };
        break;
      case 'price-high':
        sortObj = { price: -1 };
        break;
      case 'name':
        sortObj = { name: 1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get products with pagination - only select fields needed for customer
    const products = await Product.find(filter)
      .select('_id name category price oldPrice description images tags status createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Get unique categories for filter
    const categories = await Product.distinct('category', { status: 'Active' });

    return NextResponse.json({
      success: true,
      data: products,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching public products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
