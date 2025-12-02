import { createClient } from "@supabase/supabase-js";
import type { User } from "@root/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Check if a Discord user ID is whitelisted for blog admin access
 */
export async function isDiscordUserWhitelisted(
  discordId: string,
): Promise<boolean> {
  // Check environment variable whitelist first (for quick setup)
  const envWhitelist = process.env.BLOG_ADMIN_WHITELIST || "";
  const whitelistedIds = envWhitelist
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (whitelistedIds.includes(discordId)) {
    return true;
  }

  // Check database whitelist table (for dynamic management)
  try {
    const { data, error } = await supabase
      .from("blog_admin_whitelist")
      .select("discord_id")
      .eq("discord_id", discordId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected
      console.error("Error checking whitelist:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking database whitelist:", error);
    return false;
  }
}

/**
 * Get or create a Payload blog user for a Discord user
 * This bridges the Discord auth with Payload's internal user system
 */
export async function getOrCreatePayloadUser(discordUser: User) {
  // Import getPayload from @payloadcms/next
  const { getPayload } = await import("@payloadcms/next");
  const configPromise = import("@/payload.config");

  try {
    const payload = await getPayload({ config: configPromise });

    // Check if blog user already exists for this Discord ID
    const existingUsers = await payload.find({
      collection: "blog-users",
      where: {
        email: {
          equals: discordUser.email,
        },
      },
      limit: 1,
    });

    if (existingUsers.docs.length > 0) {
      return existingUsers.docs[0];
    }

    // Create new blog user linked to Discord account
    const newUser = await payload.create({
      collection: "blog-users",
      data: {
        email: discordUser.email!,
        name: discordUser.name || "Discord User",
        role: "admin", // All whitelisted users are admins
        password: crypto.randomUUID(), // Random password (won't be used)
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error creating/fetching Payload user:", error);
    throw error;
  }
}

/**
 * Create a Payload session for a Discord user
 * This allows the Discord-authenticated user to access Payload admin
 */
export async function createPayloadSession(
  discordUser: User,
  payloadUser: { id: string; email: string; password?: string },
) {
  const { getPayload } = await import("@payloadcms/next");
  const configPromise = import("@/payload.config");

  try {
    const payload = await getPayload({ config: configPromise });

    // Create a Payload auth token
    const token = await payload.login({
      collection: "blog-users",
      data: {
        email: payloadUser.email,
        password: payloadUser.password || crypto.randomUUID(),
      },
      depth: 0,
      overrideAccess: true,
    });

    return token;
  } catch (error) {
    console.error("Error creating Payload session:", error);
    throw error;
  }
}

/**
 * Validate that a user has blog admin access
 * Checks Discord auth + whitelist
 */
export async function validateBlogAdminAccess(
  discordUser: User,
): Promise<{ allowed: boolean; reason?: string }> {
  // Check if user has Discord ID
  if (!discordUser.discordId) {
    return {
      allowed: false,
      reason: "No Discord ID associated with account",
    };
  }

  // Check if user is whitelisted
  const isWhitelisted = await isDiscordUserWhitelisted(
    discordUser.discordId as string,
  );

  if (!isWhitelisted) {
    return {
      allowed: false,
      reason: "Discord user not whitelisted for blog admin access",
    };
  }

  // Update user's blog admin status in database if not already set
  try {
    const { data: userData } = await supabase
      .from("user")
      .select("is_blog_admin")
      .eq("discord_id", discordUser.discordId)
      .single();

    if (userData && !userData.is_blog_admin) {
      await supabase
        .from("user")
        .update({ is_blog_admin: true })
        .eq("discord_id", discordUser.discordId);
    }
  } catch (error) {
    console.error("Error updating blog admin status:", error);
  }

  return { allowed: true };
}

/**
 * Add a Discord user ID to the whitelist (admin function)
 */
export async function addToWhitelist(
  discordId: string,
  addedBy: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("blog_admin_whitelist").insert({
      discord_id: discordId,
      added_by: addedBy,
      notes: notes || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Also update the user's is_blog_admin flag
    await supabase
      .from("user")
      .update({ is_blog_admin: true })
      .eq("discord_id", discordId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove a Discord user ID from the whitelist (admin function)
 */
export async function removeFromWhitelist(
  discordId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("blog_admin_whitelist")
      .delete()
      .eq("discord_id", discordId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Update the user's is_blog_admin flag
    await supabase
      .from("user")
      .update({ is_blog_admin: false })
      .eq("discord_id", discordId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all whitelisted Discord user IDs
 */
export async function getWhitelistedUsers(): Promise<
  Array<{
    discord_id: string;
    added_by: string | null;
    notes: string | null;
    created_at: string;
  }>
> {
  try {
    const { data, error } = await supabase
      .from("blog_admin_whitelist")
      .select("discord_id, added_by, notes, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching whitelist:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching whitelist:", error);
    return [];
  }
}
