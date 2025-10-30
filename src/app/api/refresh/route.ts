// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'No refresh token found',
        },
        { status: 401 }
      );
    }

    // Gọi backend API để refresh token
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refreshToken=${refreshToken}`,
        },
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Xóa cookies nếu refresh thất bại
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');

      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Refresh token failed',
        },
        { status: response.status }
      );
    }

    // Set accessToken mới vào cookie
    cookieStore.set('accessToken', data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 4, // 4 giờ
      path: '/',
    });

    // Nếu backend trả về refreshToken mới, cập nhật
    if (data.data.refreshToken) {
      cookieStore.set('refreshToken', data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      accessToken: data.data.accessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during token refresh',
      },
      { status: 500 }
    );
  }
}