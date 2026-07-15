import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/welcome',
  '/forgot-password',
];

export function middleware(request: NextRequest) {
  // Handle meet.joinbreed.com subdomain
  const host = request.headers.get('host') ?? '';
  if (host.startsWith('meet.')) {
    const { pathname, search } = request.nextUrl;
    const slug = pathname.slice(1); // strip leading slash

    // Only rewrite paths that look like room codes (e.g. oiop-ahla-eyvo)
    // Other app paths (/join/xxx, /room/xxx, /meet, etc.) pass through to their own pages
    if (/^[a-z]+-[a-z]+-[a-z]+$/.test(slug)) {
      return NextResponse.rewrite(new URL(`/join/${slug}${search}`, request.url));
    }

    // Root → landing page
    if (!slug) {
      return NextResponse.rewrite(new URL('/meet', request.url));
    }
  }

  const { pathname } = request.nextUrl;

  const isLoggedIn = request.cookies.has('breed_logged_in');
  const userRole = request.cookies.get('breed_user_role')?.value ?? '';

  const isDashboardRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/onboard');
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect unauthenticated visitors to login
  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role guard: /dashboard/preacher/* requires PREACHER, ADMIN, or SUPER_ADMIN
  const isPreachers = ['PREACHER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole);
  if (pathname.startsWith('/dashboard/preacher') && !isPreachers) {
    return NextResponse.redirect(new URL('/dashboard/home', request.url));
  }

  // Role guard: /dashboard/admin/* requires ADMIN or SUPER_ADMIN only
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);
  if (pathname.startsWith('/dashboard/admin') && !isAdmin) {
    const fallback = isPreachers ? '/dashboard/preacher/dashboard' : '/dashboard/home';
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  // Prevent logged-in users from hitting auth pages
  if (isAuthRoute && isLoggedIn) {
    const home = isPreachers ? '/dashboard/preacher/dashboard' : '/dashboard/home';
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
