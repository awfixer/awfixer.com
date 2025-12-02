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

// Public routes that don't require authentication (very restricted)
const PUBLIC_ROUTES = [
  "/", // Only the main homepage
  "/api/auth", // Auth API routes
];

// Static and system routes that should be allowed
const SYSTEM_ROUTES = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/api/health",
];

// File extensions that should be allowed (for assets)
const ALLOWED_EXTENSIONS = [
  ".css",
  ".js",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
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
    appName: "AWFixer",
    appLogo: "/x402-icon-blue.png",
  },
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow system routes and static files
  if (
    SYSTEM_ROUTES.some((route) => pathname.startsWith(route)) ||
    ALLOWED_EXTENSIONS.some((ext) => pathname.endsWith(ext))
  ) {
    return NextResponse.next();
  }

  // Allow auth API routes without checking authentication
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow only the main homepage without authentication
  if (pathname === "/" || PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // For all other routes, require authentication
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      // Redirect to Discord auth with return URL
      const signInUrl = new URL("/api/auth/sign-in/discord", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // User is authenticated, check if they need to complete profile
    if (!session.user.name && pathname !== "/auth/complete-profile") {
      const completeProfileUrl = new URL("/auth/complete-profile", request.url);
      completeProfileUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(completeProfileUrl);
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    // Redirect to Discord auth on any auth error
    const signInUrl = new URL("/api/auth/sign-in/discord", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Apply payment middleware if needed for protected content
  if (pathname.startsWith("/protected")) {
    return paymentMW(request);
  }

  // Allow authenticated users to access all other content
  return NextResponse.next();
}

// Configure which paths the middleware should run on (everything except auth API)
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth/* (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * But include all other paths to enforce authentication
     */
    "/((?!api/auth|_next/static|_next/image).*)",
  ],
  runtime: "nodejs",
};
