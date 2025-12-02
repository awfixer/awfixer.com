/**
 * Discord Bot Utilities
 * Handles adding users to the Discord server after authentication
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10';

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
}

interface AddGuildMemberOptions {
  accessToken: string;
  userId: string;
  guildId: string;
  botToken: string;
}

/**
 * Add a user to the Discord server using their OAuth access token
 * @param options - Configuration for adding the user to the guild
 * @returns Promise with the result of the operation
 */
export async function addUserToDiscordServer(
  options: AddGuildMemberOptions
): Promise<{ success: boolean; error?: string }> {
  const { accessToken, userId, guildId, botToken } = options;

  if (!accessToken || !userId || !guildId || !botToken) {
    return {
      success: false,
      error: 'Missing required parameters',
    };
  }

  try {
    const response = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      }
    );

    // Status 201 = User was added
    // Status 204 = User was already in the server
    if (response.status === 201 || response.status === 204) {
      return { success: true };
    }

    // Handle specific error cases
    if (response.status === 403) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `Permission denied: ${error.message || 'Bot lacks necessary permissions'}`,
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        error: 'Invalid bot token',
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.message || `Discord API error: ${response.status}`,
    };
  } catch (error) {
    console.error('Failed to add user to Discord server:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Verify that the bot has the necessary permissions in the guild
 * @param guildId - Discord server ID
 * @param botToken - Discord bot token
 * @returns Promise with verification result
 */
export async function verifyBotPermissions(
  guildId: string,
  botToken: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}`,
      {
        headers: {
          'Authorization': `Bot ${botToken}`,
        },
      }
    );

    if (response.ok) {
      return { valid: true };
    }

    if (response.status === 401) {
      return { valid: false, error: 'Invalid bot token' };
    }

    if (response.status === 403) {
      return { valid: false, error: 'Bot is not in the server' };
    }

    return { valid: false, error: `Unexpected status: ${response.status}` };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user information from Discord API
 * @param accessToken - User's OAuth access token
 * @returns Promise with user data
 */
export async function getDiscordUser(
  accessToken: string
): Promise<DiscordUser | null> {
  try {
    const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch Discord user:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    return null;
  }
}
