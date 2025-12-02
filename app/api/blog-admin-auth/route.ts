import { NextRequest, NextResponse } from "next/server";
import { auth } from "@root/auth";
import {
  validateBlogAdminAccess,
  getOrCreatePayloadUser,
} from "@root/lib/payload-auth";

/**
 * Blog Admin Authentication Endpoint
 *
 * This endpoint bridges Discord authentication with Payload CMS admin access.
 * It checks if the Discord-authenticated user is whitelisted for blog admin,
 * and if so, creates/retrieves their Payload user account.
 *
 * Flow:
 * 1. Check Discord authentication
 * 2. Verify user is whitelisted for blog admin
 * 3. Get or create corresponding Payload user
 * 4. Return success with user info
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated via Discord
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
          message: "Please sign in with Discord first",
        },
        { status: 401 }
      );
    }

    const discordUser = session.user;

    // Validate blog admin access (checks whitelist)
    const accessCheck = await validateBlogAdminAccess(discordUser);

    if (!accessCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
          message:
            accessCheck.reason ||
            "Your Discord account is not authorized for blog admin access",
          discordId: discordUser.discordId,
        },
        { status: 403 }
      );
    }

    // Get or create Payload user for this Discord account
    const payloadUser = await getOrCreatePayloadUser(discordUser);

    return NextResponse.json({
      success: true,
      message: "Blog admin access granted",
      user: {
        id: payloadUser.id,
        email: payloadUser.email,
        name: payloadUser.name,
        discordId: discordUser.discordId,
      },
    });
  } catch (error) {
    console.error("Blog admin auth error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to process blog admin authentication",
      },
      { status: 500 }
    );
  }
}

/**
 * Check blog admin access status
 * POST endpoint to verify if current user can access blog admin
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          hasAccess: false,
          reason: "Not authenticated with Discord",
        },
        { status: 200 }
      );
    }

    const accessCheck = await validateBlogAdminAccess(session.user);

    return NextResponse.json(
      {
        hasAccess: accessCheck.allowed,
        reason: accessCheck.reason,
        user: accessCheck.allowed
          ? {
              discordId: session.user.discordId,
              name: session.user.name,
              email: session.user.email,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Blog admin access check error:", error);
    return NextResponse.json(
      {
        hasAccess: false,
        reason: "Error checking access",
      },
      { status: 500 }
    );
  }
}
