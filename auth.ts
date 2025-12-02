import { betterAuth } from "better-auth";
import { discord } from "better-auth/providers/discord";
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
    enabled: true,
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      scope: ["identify", "email", "guilds.join"], // Add guilds.join scope
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
    },
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
  hooks: {
    after: [
      {
        matcher: () => true,
        handler: async (ctx: any) => {
          // Add user to Discord server after successful OAuth
          if (ctx.context?.socialProvider === "discord" && ctx.user) {
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
            if (account?.access_token && ctx.user.discordId) {
              try {
                const result = await addUserToDiscordServer({
                  accessToken: account.access_token,
                  userId: ctx.user.discordId,
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
          }
        },
      },
    ],
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
