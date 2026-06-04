import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Rediriger les utilisateurs bannis
    if (token?.status === 'banned') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'banned');
      return NextResponse.redirect(loginUrl);
    }

    // Protection des routes d'administration
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (token?.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ error: 'Accès interdit. Administrateur requis.' }),
            { status: 403, headers: { 'content-type': 'application/json' } }
          );
        }
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Protection des routes journaliste
    if (pathname.startsWith('/journalist')) {
      if (token?.role !== 'journalist' && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/journalist/:path*',
  ],
};
