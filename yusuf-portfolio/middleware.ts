import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Only these paths exist in this app (portfolio home, dashboard, auth, metadata).
 * Anything else (e.g. /4hire, /hire) redirects to / so users don't hit a broken 404 chunk.
 */
function isAllowedPath(pathname: string) {
  if (pathname === "/" || pathname === "/icon") return true;
  /** Hire lives at /#hire; /hire is a tiny client redirect page (see app/hire/page.tsx). */
  if (pathname === "/hire") return true;
  if (pathname === "/refer" || pathname.startsWith("/refer/")) return true;
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/setup")) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  return false;
}

/**
 * Attach the request pathname so server layouts can read `headers().get("x-pathname")`.
 * Matcher must cover every app route that uses that header; otherwise pathname is "" and
 * auth redirects can mis-fire (e.g. redirect loop → 500).
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Basic security: if trying to access dashboard but no session cookie exists, redirect to login
  // Note: Deep validation happens in the layout, this is just a quick preventative layer.
  if (pathname.startsWith("/dashboard")) {
    const session = request.cookies.get("session");
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (!isAllowedPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
      All pages except static assets and Next internals.
      Use `api(?:/|$)` and `_next/` so we do not skip middleware for paths like `/applications`.
    */
    "/((?!api(?:/|$)|_next/|favicon\\.ico$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|css)$).*)",
  ],
};
