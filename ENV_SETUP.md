# Environment Variables Setup

This document outlines the required environment variables for the AWFixer application, with special focus on Discord integration.

## Required Environment Variables

### Database (Supabase)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Discord OAuth
```env
DISCORD_CLIENT_ID=your_discord_application_client_id
DISCORD_CLIENT_SECRET=your_discord_application_client_secret
```

### Discord Server Integration (Required for auto-joining)
```env
DISCORD_SERVER_ID=your_discord_server_id
DISCORD_BOT_TOKEN=your_discord_bot_token
```

## Discord Setup Guide

### Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "AWFixer Auth")
4. Navigate to the "OAuth2" section
5. Copy the **Client ID** and **Client Secret**
6. Add these to your `.env.local` as `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`

### Step 2: Configure OAuth2 Redirects

In the OAuth2 section:
1. Add your redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/discord`
   - Production: `https://yourdomain.com/api/auth/callback/discord`
2. Under "OAuth2 URL Generator":
   - Select scopes: `identify`, `email`, `guilds.join`
   - Note: `guilds.join` is required for auto-adding users to your server

### Step 3: Create a Discord Bot

1. In your Discord Application, go to the "Bot" section
2. Click "Add Bot"
3. Under "Token", click "Reset Token" and copy it
4. Add this to your `.env.local` as `DISCORD_BOT_TOKEN`
5. **Important**: Keep this token secret and never commit it to version control

### Step 4: Configure Bot Permissions

Required bot permissions:
- `CREATE_INSTANT_INVITE` (optional, for invites)
- `MANAGE_GUILD` (to add members)

To get the bot permission integer:
1. Go to OAuth2 > URL Generator
2. Select bot scope
3. Select permissions: "Create Invite", "Manage Server"
4. Copy the generated URL

### Step 5: Invite Bot to Your Server

1. Use the URL from Step 4 to invite the bot
2. Select your server
3. Authorize the bot with the required permissions

### Step 6: Get Your Server ID

1. Enable Developer Mode in Discord:
   - User Settings > Advanced > Developer Mode
2. Right-click your server icon
3. Click "Copy Server ID"
4. Add this to your `.env.local` as `DISCORD_SERVER_ID`

## Example .env.local File

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Discord OAuth
DISCORD_CLIENT_ID=1234567890123456789
DISCORD_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz123456

# Discord Server Integration
DISCORD_SERVER_ID=987654321098765432
DISCORD_BOT_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.GhIjKl.MnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUv
```

## How It Works

When a user signs in with Discord:

1. User clicks "Sign in with Discord"
2. User is redirected to Discord OAuth page
3. User authorizes the application with `identify`, `email`, and `guilds.join` scopes
4. Discord redirects back to your app with an access token
5. The auth system creates/updates the user in your database
6. **Automatically**: The system uses the bot token and user's access token to add them to your Discord server
7. User is redirected to their original destination

## Troubleshooting

### Bot Can't Add Users

**Error**: "Missing Permissions"
- Ensure the bot has "Manage Server" or "Create Instant Invite" permission
- Verify the bot is actually in your server
- Check that `DISCORD_BOT_TOKEN` is correct

**Error**: "Invalid OAuth Token"
- Verify `guilds.join` scope is included in your OAuth2 configuration
- Make sure users are re-authorizing if you added the scope later

### Users Not Being Added

- Check server logs for error messages
- Verify `DISCORD_SERVER_ID` matches your actual server ID
- Ensure the bot has the required permissions in your server
- Confirm the OAuth redirect URLs are correctly configured

### Rate Limiting

Discord has rate limits for API calls:
- If you have many users signing in simultaneously, some may fail to join
- The system will log errors but won't prevent user authentication
- Users can manually join via an invite link if auto-join fails

## Security Notes

1. **Never commit** your `.env.local` file to version control
2. Add `.env.local` to your `.gitignore`
3. Use different Discord applications for development and production
4. Rotate tokens periodically
5. Monitor your bot's activity in Discord's developer portal
6. The bot token grants significant permissions - treat it like a password

## Optional: Environment Variables

### Analytics
```env
# Vercel Analytics (already integrated)
# No additional setup needed if deployed on Vercel
```

### Sentry (Error Tracking)
```env
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

## Testing Discord Integration

To test the Discord integration locally:

1. Set up all environment variables in `.env.local`
2. Start your development server: `npm run dev`
3. Navigate to a protected page
4. Sign in with Discord
5. Check your Discord server - you should be automatically added
6. Check server logs for success/error messages

## Production Deployment

When deploying to production (e.g., Vercel):

1. Add all environment variables to your hosting platform
2. Update Discord OAuth redirect URLs to include production domain
3. Use a separate Discord application for production (recommended)
4. Test the flow in production before announcing to users

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are correctly set
3. Test bot permissions by manually inviting a test user
4. Consult Discord's API documentation: https://discord.com/developers/docs