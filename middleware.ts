import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/welcome',
  '/forgot-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We cannot read localStorage in middleware (Edge runtime), so we rely on
  // the `breed_logged_in` cookie that AuthContext sets on login and clears on
  // logout.
  const isLoggedIn = request.cookies.has('breed_logged_in');

  const isDashboardRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/onboard');

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Protect dashboard/onboard routes — redirect unauthenticated visitors to login
  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the originally requested URL so we can redirect back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent logged-in users from hitting auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
