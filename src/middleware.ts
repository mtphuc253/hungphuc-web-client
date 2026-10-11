// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminPath } from "@/lib/admin-routes";

const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 4; // 4 giờ - khớp với hạn JWT ở backend

function redirectToLogin(request: NextRequest) {
  const url = new URL("/auth/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  const res = NextResponse.redirect(url);
  res.cookies.delete("accessToken");
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Đã đăng nhập mà vào trang login -> về dashboard
  if (pathname === "/auth/login") {
    if (accessToken || refreshToken) {
      return NextResponse.redirect(new URL("/thong-ke", request.url));
    }
    return NextResponse.next();
  }

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  // Trang quản trị không được index
  const withNoIndex = (res: NextResponse) => {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  };

  if (accessToken) {
    return withNoIndex(NextResponse.next());
  }

  // Hết accessToken nhưng còn refreshToken -> gọi thẳng backend để cấp token mới
  if (refreshToken) {
    try {
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `refreshToken=${refreshToken}`,
          },
          cache: "no-store",
        }
      );

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const newAccessToken: string | undefined = refreshData?.data?.accessToken;

        if (newAccessToken) {
          const response = NextResponse.next();
          response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: ACCESS_COOKIE_MAX_AGE,
            path: "/",
          });
          return withNoIndex(response);
        }
      }
    } catch (error) {
      console.error("Middleware refresh error:", error);
    }

    const res = redirectToLogin(request);
    res.cookies.delete("refreshToken");
    return res;
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: [
    /*
     * Bỏ qua: api, _next/static, _next/image, favicon, file tĩnh có phần mở rộng
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
