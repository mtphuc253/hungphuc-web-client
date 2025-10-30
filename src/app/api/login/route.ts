// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Gọi backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Login failed',
        },
        { status: response.status }
      );
    }

    // Nếu login thành công, set cookies
    const cookieStore = await cookies();
    
    // Set access token cookie
    cookieStore.set('accessToken', data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 4, // 4 giờ
      path: '/',
    });

    // Set refresh token cookie (BE đã set nhưng chúng ta set lại để đảm bảo)
    if (data.data.refreshToken) {
      cookieStore.set('refreshToken', data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
        path: '/',
      });
    }

    // Trả về user info và accessToken cho client
    return NextResponse.json({
      success: true,
      message: data.message,
      user: {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role,
      },
      accessToken: data.data.accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}