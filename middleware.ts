import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'visualref.com';
const LOCALHOST = 'localhost';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  const cleanHost = host.replace(/:\d+$/, '').toLowerCase();
  const isInternal = cleanHost === LOCALHOST || 
                     cleanHost === MAIN_DOMAIN || 
                     cleanHost === `app.${MAIN_DOMAIN}` || 
                     cleanHost === `dashboard.${MAIN_DOMAIN}` ||
                     cleanHost === `www.${MAIN_DOMAIN}`;

  if (isInternal) {
    return NextResponse.next();
  }

  const domain = cleanHost;
  const url = new URL(request.url);
  url.pathname = `/${domain}${pathname === '/' ? '' : pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};