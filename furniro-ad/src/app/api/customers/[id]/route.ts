import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { authMiddleware } from '@/lib/auth';

// GET /api/customers/[id] - Get single customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const { id } = await params;
    const customer = await Customer.findById(id).select('-password').lean();

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Add computed fields
    const customerWithComputed = {
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      defaultShippingAddress: customer.addresses?.find(addr => addr.isDefault && addr.type === 'shipping'),
      defaultBillingAddress: customer.addresses?.find(addr => addr.isDefault && addr.type === 'billing')
    };

    return NextResponse.json({
      success: true,
      data: customerWithComputed
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin/manager role
    const authResult = await authMiddleware(request, ['admin', 'manager']);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    
    const {
      email,
      firstName,
      lastName,
      phone,
      addresses,
      isActive,
      isEmailVerified,
      totalOrders,
      totalSpent,
      lastOrderDate
    } = body;

    // Find customer
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (email && email.toLowerCase() !== customer.email) {
      const existingCustomer = await Customer.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      
      if (existingCustomer) {
        return NextResponse.json(
          { success: false, error: 'Customer with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update fields
    if (email) customer.email = email.toLowerCase();
    if (firstName) customer.firstName = firstName.trim();
    if (lastName) customer.lastName = lastName.trim();
    if (phone !== undefined) customer.phone = phone?.trim();
    if (addresses !== undefined) customer.addresses = addresses;
    if (isActive !== undefined) customer.isActive = isActive;
    if (isEmailVerified !== undefined) customer.isEmailVerified = isEmailVerified;
    if (totalOrders !== undefined) customer.totalOrders = totalOrders;
    if (totalSpent !== undefined) customer.totalSpent = totalSpent;
    if (lastOrderDate !== undefined) customer.lastOrderDate = lastOrderDate;

    await customer.save();

    // Return updated customer without password
    const updatedCustomer = customer.toObject();
    delete updatedCustomer.password;

    return NextResponse.json({
      success: true,
      data: {
        ...updatedCustomer,
        fullName: `${updatedCustomer.firstName} ${updatedCustomer.lastName}`
      }
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer (soft delete by setting isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role only
    const authResult = await authMiddleware(request, ['admin']);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const { id } = await params;
    
    // Check if customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Soft delete - set isActive to false instead of actually deleting
    customer.isActive = false;
    await customer.save();

    return NextResponse.json({
      success: true,
      message: 'Customer deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
