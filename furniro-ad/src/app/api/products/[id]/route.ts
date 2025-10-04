import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Check if product exists
    const existingProduct = await Product.findById(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if SKU is being changed and if it already exists
    if (body.sku && body.sku !== existingProduct.sku) {
      const skuExists = await Product.findOne({ 
        sku: body.sku, 
        _id: { $ne: params.id } 
      });
      
      if (skuExists) {
        return NextResponse.json(
          { success: false, error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      ...body,
      price: body.price ? parseFloat(body.price) : undefined,
      oldPrice: body.oldPrice !== undefined ? (body.oldPrice ? parseFloat(body.oldPrice) : null) : undefined,
      stock: body.stock ? parseInt(body.stock) : undefined,
      tags: body.tags ? body.tags.split(',').map((tag: string) => tag.trim()) : undefined,
      images: body.images !== undefined ? body.images : undefined,
      detailedImages: body.detailedImages !== undefined ? body.detailedImages : undefined
    };

    const product = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const product = await Product.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
