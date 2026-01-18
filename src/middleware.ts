import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const pathname = request.nextUrl.pathname;

  console.log(`[middleware] ${request.method} ${pathname}, token present: ${!!token}`);

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin'];
  const adminRoutes = ['/admin'];
  
  const pathname_is_protected = protectedRoutes.some((route) => pathname.startsWith(route));
  const pathname_is_admin = adminRoutes.some((route) => pathname.startsWith(route));

  // If requesting a protected route without a token, redirect to login
  if (pathname_is_protected && !token) {
    console.log(`[middleware] No token for protected route ${pathname}, redirecting to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If requesting admin route with a token, verify it's an admin
  if (pathname_is_admin && token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      const payload = verified.payload as any;
      
      if (payload.role !== 'admin') {
        console.log(`[middleware] User is not admin, redirecting to /dashboard`);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      console.log(`[middleware] Admin user authorized for ${pathname}`);
    } catch (error: any) {
      console.log(`[middleware] Token verification failed, redirecting to /login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
