import { Address } from "viem";
import { paymentMiddleware, Network, Resource } from "x402-next";
import { NextRequest, NextResponse } from "next/server";
import { betterAuth } from "better-auth";
import { createClient } from "@supabase/supabase-js";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as Address;
const network = process.env.NETWORK as Network;

// Auth setup for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const auth = betterAuth({
  database: {
    provider: "supabase",
    supabase: supabase,
  },
});

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/settings"];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/blog",
  "/help",
  "/auth/sign-in",
  "/auth/sign-up",
  "/api/auth",
];

const paymentMW = paymentMiddleware(
  payTo,
  {
    "/protected": {
      price: "$0.01",
      network,
      config: {
        description: "Access to protected content",
      },
    },
  },
  {
    url: facilitatorUrl,
  },
  {
    appName: "Next x402 Demo",
    appLogo: "/x402-icon-blue.png",
  },
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public routes and API routes
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    // Still apply payment middleware if needed
    if (pathname.startsWith("/protected")) {
      return paymentMW(request);
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        // Redirect to sign in with return URL
        const signInUrl = new URL("/auth/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Redirect to sign in on auth error
      const signInUrl = new URL("/auth/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Apply payment middleware if needed
  if (pathname.startsWith("/protected")) {
    return paymentMW(request);
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
  runtime: "nodejs",
};
