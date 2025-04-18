import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for admin routes that need protection
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // If accessing admin page, check for access token
  if (isAdminPage) {
    const accessToken = request.cookies.get('accessToken');
    
    // If no access token found, redirect to login
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If already logged in and trying to access login page, redirect to admin
  if (isLoginPage) {
    const accessToken = request.cookies.get('accessToken');
    if (accessToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}; 