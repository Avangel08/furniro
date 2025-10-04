import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [Customer Logout] Processing logout...');

    // Clear the refresh token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear customer refresh token cookie
    response.headers.set(
      'Set-Cookie',
      'customerRefreshToken=; HttpOnly; SameSite=strict; Max-Age=0; Path=/'
    );

    console.log('✅ [Customer Logout] Logout successful');
    return response;

  } catch (error) {
    console.error('❌ [Customer Logout] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Logout failed' 
      },
      { status: 500 }
    );
  }
}
