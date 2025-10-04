import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json(
      {
        success: true,
        data: {
          user: authResult.user
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
