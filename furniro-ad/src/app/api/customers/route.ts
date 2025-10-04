import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { authMiddleware } from '@/lib/auth';

// Force import to ensure model is registered
console.log('🔧 Customer API route loaded, Customer model:', !!Customer);

// GET /api/customers - List all customers with pagination and search
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [GET /api/customers] Starting...');
    
    // Check authentication
    console.log('🔍 [GET /api/customers] Checking auth...');
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      console.log('❌ [GET /api/customers] Auth failed:', authResult.error);
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    console.log('✅ [GET /api/customers] Auth successful');

    console.log('🔍 [GET /api/customers] Connecting to DB...');
    await connectDB();
    console.log('✅ [GET /api/customers] DB connected');

    console.log('🔍 [GET /api/customers] Customer model:', !!Customer);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const status = searchParams.get('status'); // 'active', 'inactive', or undefined for all

    // Build search filter
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const skip = (page - 1) * limit;

    // Build sort options
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder;

    console.log('🔍 [GET /api/customers] Querying customers with filter:', filter);
    console.log('🔍 [GET /api/customers] Sort options:', sortOptions);
    console.log('🔍 [GET /api/customers] Skip:', skip, 'Limit:', limit);
    
    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .select('-password') // Exclude password field
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter)
    ]);
    
    console.log('✅ [GET /api/customers] Found customers:', customers.length, 'Total:', total);

    // Add computed fields
    const customersWithComputed = customers.map(customer => ({
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      defaultShippingAddress: customer.addresses?.find(addr => addr.isDefault && addr.type === 'shipping'),
      defaultBillingAddress: customer.addresses?.find(addr => addr.isDefault && addr.type === 'billing')
    }));

    return NextResponse.json({
      success: true,
      data: customersWithComputed,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ [GET /api/customers] Error details:', error);
    console.error('❌ [GET /api/customers] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer (admin only)
export async function POST(request: NextRequest) {
  console.log('🚀 [POST /api/customers] Starting...');
  
  try {
    // Step 1: Auth
    console.log('🔍 [POST /api/customers] Step 1: Auth...');
    const authResult = await authMiddleware(request, ['admin', 'manager']);
    
    if (!authResult.success) {
      console.log('❌ [POST /api/customers] Auth failed:', authResult.error);
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status || 401 });
    }
    console.log('✅ [POST /api/customers] Auth successful');

    // Step 2: DB
    console.log('🔍 [POST /api/customers] Step 2: DB...');
    await connectDB();
    console.log('✅ [POST /api/customers] DB connected');

    // Step 3: Parse
    console.log('🔍 [POST /api/customers] Step 3: Parse...');
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      addresses,
      isActive = true,
      isEmailVerified = false
    } = body;
    console.log('✅ [POST /api/customers] Parsed:', { email, firstName, lastName });

    // Step 4: Validate
    console.log('🔍 [POST /api/customers] Step 4: Validate...');
    if (!email || !password || !firstName || !lastName) {
      console.log('❌ [POST /api/customers] Validation failed');
      return NextResponse.json(
        { success: false, error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }
    console.log('✅ [POST /api/customers] Validation passed');

    // Step 5: Check existing
    console.log('🔍 [POST /api/customers] Step 5: Check existing...');
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      console.log('❌ [POST /api/customers] Customer exists');
      return NextResponse.json(
        { success: false, error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }
    console.log('✅ [POST /api/customers] No existing customer');

    // Step 6: Create
    console.log('🔍 [POST /api/customers] Step 6: Create...');
    const customer = new Customer({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      addresses: addresses || [],
      isActive,
      isEmailVerified
    });

    console.log('🔍 [POST /api/customers] Step 7: Save...');
    await customer.save();
    console.log('✅ [POST /api/customers] Customer saved!');

    // Step 8: Response
    const customerData = customer.toObject();
    delete customerData.password;

    console.log('✅ [POST /api/customers] Success!');
    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      data: {
        ...customerData,
        fullName: `${customerData.firstName} ${customerData.lastName}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [POST /api/customers] Unexpected error:', error);
    console.error('❌ [POST /api/customers] Error message:', error.message);
    console.error('❌ [POST /api/customers] Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create customer',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
