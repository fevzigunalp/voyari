import { NextResponse, type NextRequest } from "next/server";

/**
 * Force-fresh HTML responses so stale deploys don't keep referencing dead chunk
 * hashes for hours. Static assets under /_next/static/* remain immutable.
 *
 * Runs on Cloudflare Pages edge runtime.
 */
export const config = {
  matcher: [
    // All paths except hashed static assets, API routes, and well-known files.
    "/((?!_next/static|_next/image|api|favicon|robots.txt|sitemap.xml|logo|og-image|.*\\.(?:js|css|svg|png|jpg|jpeg|webp|ico|woff2?)).*)",
  ],
};

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  // HTML shell must revalidate so deploys take effect immediately.
  res.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  return res;
}
