// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Các route public không cần authentication
const publicRoutes = ['/auth/login', '/gioi-thieu', '/lien-lac', '/tin-tuc', '/thi-cong-xay-dung', '/thiet-ke-kien-truc'];

// Các route admin cần authentication
const adminRoutes = ['/thong-ke', '/lien-he-khach-hang'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy tokens từ cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Check nếu là route admin
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  
  // Check nếu là route auth/login
  const isLoginRoute = pathname === '/auth/login';

  // Nếu đang ở trang login và đã có accessToken, redirect về admin
  if (isLoginRoute && accessToken) {
    return NextResponse.redirect(new URL('/thong-ke', request.url));
  }

  // Nếu là route admin
  if (isAdminRoute) {
    // Case 1: Có accessToken - cho phép truy cập
    if (accessToken) {
      return NextResponse.next();
    }

    // Case 2: Không có accessToken nhưng có refreshToken - thử refresh
    if (refreshToken) {
      try {
        // Gọi internal refresh API
        const refreshResponse = await fetch(
          new URL('/api/auth/refresh', request.url).toString(),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: `refreshToken=${refreshToken}`,
            },
          }
        );

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.success) {
          // Refresh thành công, tạo response mới với cookie đã update
          const response = NextResponse.next();
          
          // Set accessToken mới vào cookie
          response.cookies.set('accessToken', refreshData.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 4, // 4 giờ
            path: '/',
          });

          return response;
        }
      } catch (error) {
        console.error('Middleware refresh error:', error);
      }

      // Nếu refresh fail, redirect về login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Case 3: Không có cả accessToken và refreshToken - redirect về login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Các route khác - cho phép truy cập
  return NextResponse.next();
}

// Cấu hình matcher để middleware chỉ chạy trên các route cần thiết
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};