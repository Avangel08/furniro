import { NextRequest, NextResponse } from 'next/server';
import { createCookieString, getCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful'
      },
      { status: 200 }
    );

    // Clear refresh token cookie
    const clearCookieOptions = {
      ...getCookieOptions(),
      maxAge: 0 // Expire immediately
    };
    
    const clearCookie = createCookieString('refreshToken', '', clearCookieOptions);
    response.headers.set('Set-Cookie', clearCookie);

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
