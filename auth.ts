import { betterAuth } from "better-auth";
import { createClient } from "@supabase/supabase-js";
import { addUserToDiscordServer } from "@root/lib/discord-bot";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const auth = betterAuth({
  database: {
    provider: "supabase",
    supabase: supabase,
  },
  emailAndPassword: {
    enabled: false, // Disabled - Discord-only authentication
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      scope: ["identify", "email", "guilds.join"],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  user: {
    additionalFields: {
      discordId: {
        type: "string",
        required: false,
      },
      avatar: {
        type: "string",
        required: false,
      },
      username: {
        type: "string",
        required: false,
      },
      isBlogAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
  hooks: {
    after: [
      {
        matcher: () => true,
        handler: async (ctx) => {
          // Type guard to check if this is a social provider authentication
          if (
            ctx.context?.socialProvider === "discord" &&
            ctx.user &&
            "discordId" in ctx.user
          ) {
            // Add user to Discord server after successful OAuth
            const discordServerId = process.env.DISCORD_SERVER_ID;
            const discordBotToken = process.env.DISCORD_BOT_TOKEN;

            if (!discordServerId || !discordBotToken) {
              console.warn(
                "Discord server integration not configured. Missing DISCORD_SERVER_ID or DISCORD_BOT_TOKEN",
              );
              return;
            }

            // Get the access token from the account
            const account = ctx.account;
            if (
              account &&
              "access_token" in account &&
              account.access_token &&
              ctx.user.discordId
            ) {
              try {
                const result = await addUserToDiscordServer({
                  accessToken: account.access_token as string,
                  userId: ctx.user.discordId as string,
                  guildId: discordServerId,
                  botToken: discordBotToken,
                });

                if (result.success) {
                  console.log(
                    `Successfully added user ${ctx.user.discordId} to Discord server`,
                  );
                } else {
                  console.error(
                    `Failed to add user to Discord server: ${result.error}`,
                  );
                }
              } catch (error) {
                console.error("Error adding user to Discord server:", error);
              }
            }

            // Check if user is in blog admin whitelist
            const whitelist = process.env.BLOG_ADMIN_WHITELIST || "";
            const whitelistedIds = whitelist
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean);

            if (
              ctx.user.discordId &&
              whitelistedIds.includes(ctx.user.discordId as string)
            ) {
              // Update user to mark as blog admin
              try {
                const { data, error } = await supabase
                  .from("user")
                  .update({ is_blog_admin: true })
                  .eq("discord_id", ctx.user.discordId);

                if (!error) {
                  console.log(
                    `User ${ctx.user.discordId} marked as blog admin`,
                  );
                }
              } catch (error) {
                console.error("Error updating blog admin status:", error);
              }
            }
          }
        },
      },
    ],
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
