import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define valid routes in your application
  const validRoutes = [
    '/',
    '/admin',
    '/business',
    '/businesses',
    '/chats',
    '/forgot-password',
    '/marketplace',
    '/notifications',
    '/onboarding',
    '/post',
    '/products',
    '/profile',
    '/reels',
    '/reset-password',
    '/saved',
    '/search',
    '/services',
    '/settings',
    '/signin',
    '/signup',
    '/trending',
    '/userprofile',
    '/api'
  ];

  // Define protected routes
  const protectedRoutes = [
    '/dashboard', 
    '/profile', 
    '/chats', 
    '/notifications',
    '/saved',
    '/settings',
    '/marketplace',
    '/post',
    '/reels',
    '/business',
    '/businesses',
    '/services'
  ];
  
  const authRoutes = ['/signin', '/signup', '/login', '/forgot-password', '/reset-password'];

  // Skip middleware for static assets, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // If user has token and tries to access auth pages, redirect to home
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user doesn't have token and tries to access protected routes, redirect to signin
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Check if the route is valid (for basic route validation)
  // Note: Next.js will handle 404s automatically for non-existent routes
  // This middleware is mainly for auth flow
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};