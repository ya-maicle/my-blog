import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Protect admin routes and API endpoints.
 * - Unauthenticated users are redirected to the NextAuth sign-in page.
 * - Authenticated users without the ADMIN role receive 403 Forbidden.
 *
 * Matcher (below) limits this middleware to:
 * - /dashboard/*
 * - /users/*
 * - /api/admin/*
 */

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }

    if ((token as any).role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.next();
  } catch (err) {
    console.error("[admin][middleware] auth check failed", err);
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/users/:path*", "/api/admin/:path*"],
};
