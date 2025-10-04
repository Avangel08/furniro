import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/public/products/[id] - Get single product for customer site
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Find product and only return if it's active
    const product = await Product.findOne({ 
      _id: params.id,
      status: 'Active' // Only show active products to customers (case-sensitive)
    }).lean();
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products (same category, different product, limit 4)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'Active'
    })
    .select('_id name category price oldPrice description images tags')
    .limit(4)
    .lean();

    return NextResponse.json({
      success: true,
      data: product,
      relatedProducts
    });

  } catch (error) {
    console.error('Error fetching public product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
