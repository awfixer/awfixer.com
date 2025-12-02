# Discord Authentication & Blog Admin Whitelist Setup

This document explains the Discord-only authentication system and the whitelist-based access control for the Payload CMS blog admin panel.

## Overview

The authentication system has been configured with the following requirements:

1. **Discord-Only Login**: Email/password authentication is disabled. All users must authenticate via Discord OAuth.
2. **Blog Admin Whitelist**: Only Discord users whose IDs are in a whitelist can access the Payload CMS blog admin panel at `/blog-admin`.
3. **Automatic User Creation**: When a whitelisted Discord user accesses the blog admin, a Payload user account is automatically created for them.

## Architecture

```
User Request → Middleware → Discord Auth Check → Whitelist Check → Payload Access
                                 ↓                      ↓
                          Redirect to Login    Redirect to Error Page
```

### Components

1. **better-auth** (`auth.ts`): Handles Discord OAuth authentication
2. **Middleware** (`middleware.ts`): Protects routes and checks whitelist
3. **Payload Auth Bridge** (`lib/payload-auth.ts`): Links Discord auth to Payload
4. **Payload Config** (`payload.config.ts`): Blog CMS with Discord-linked users
5. **Database Schema**: User table with `is_blog_admin` flag and whitelist table

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Required: Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Required: Supabase/Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://user:password@host:port/database

# Required: Better Auth
BETTER_AUTH_SECRET=generate_a_secure_random_string_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Required: Payload CMS
PAYLOAD_SECRET=generate_another_secure_random_string_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Required: Blog Admin Whitelist (comma-separated Discord user IDs)
BLOG_ADMIN_WHITELIST=123456789012345678,987654321098765432

# Optional: Discord Server Integration
DISCORD_SERVER_ID=your_discord_server_id
DISCORD_BOT_TOKEN=your_discord_bot_token
```

### Generating Secrets

```bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Generate PAYLOAD_SECRET
openssl rand -hex 32
```

## Getting Discord User IDs for Whitelist

To add users to the blog admin whitelist, you need their Discord user IDs.

### Method 1: Enable Developer Mode in Discord

1. Open Discord and go to **User Settings** (gear icon)
2. Go to **Advanced** → Enable **Developer Mode**
3. Right-click on any user and select **Copy User ID**
4. Add the ID to `BLOG_ADMIN_WHITELIST` in your `.env.local`

### Method 2: From Your Application

After a user signs in with Discord, their ID is stored in the database:

```sql
SELECT discord_id, name, email 
FROM "user" 
WHERE discord_id IS NOT NULL;
```

### Method 3: Use the Discord API

```bash
# After authentication, you can see the user ID in the auth flow
# It's returned as part of the Discord OAuth response
```

## Database Setup

### 1. Run the Schema Migration

The updated schema includes:
- `is_blog_admin` column on the `user` table
- `blog_admin_whitelist` table for dynamic management

```bash
# Run this SQL in your Supabase SQL Editor or PostgreSQL client
psql $DATABASE_URL < database/schema.sql
```

### 2. Add Existing Users to Whitelist

If you already have Discord users in your system and want to grant them blog admin access:

```sql
-- Add a Discord user ID to the whitelist
INSERT INTO blog_admin_whitelist (discord_id, notes) 
VALUES ('123456789012345678', 'Admin user - John Doe');

-- Update user's blog admin flag
UPDATE "user" 
SET is_blog_admin = true 
WHERE discord_id = '123456789012345678';
```

## Managing the Whitelist

### Environment Variable Whitelist (Recommended for Initial Setup)

The simplest way to manage blog admins is through the `BLOG_ADMIN_WHITELIST` environment variable:

```env
# Single user
BLOG_ADMIN_WHITELIST=123456789012345678

# Multiple users (comma-separated, no spaces around commas)
BLOG_ADMIN_WHITELIST=123456789012345678,987654321098765432,456789012345678901
```

**Advantages:**
- Easy to set up
- Works immediately
- Version controllable (in `.env.example`)
- Good for small teams

**Disadvantages:**
- Requires app restart to add/remove users
- Not suitable for large teams

### Database Whitelist (Recommended for Production)

For production or larger teams, use the `blog_admin_whitelist` table:

```sql
-- Add user to whitelist
INSERT INTO blog_admin_whitelist (discord_id, added_by, notes)
VALUES (
  '123456789012345678',
  'admin@example.com',
  'Lead developer - full access'
);

-- Remove user from whitelist
DELETE FROM blog_admin_whitelist 
WHERE discord_id = '123456789012345678';

-- View all whitelisted users
SELECT 
  w.discord_id,
  u.name,
  u.email,
  w.notes,
  w.created_at
FROM blog_admin_whitelist w
LEFT JOIN "user" u ON u.discord_id = w.discord_id
ORDER BY w.created_at DESC;
```

**Advantages:**
- No app restart needed
- Can be managed via admin API
- Includes audit trail (who added, when, why)
- Scales to any team size

**Note:** The system checks **both** the environment variable and database. If a Discord ID is in either location, access is granted.

## How It Works

### 1. User Authentication Flow

```
1. User visits any protected page (e.g., /blog, /help, /blog-admin)
2. Middleware checks for Discord session
3. If not authenticated → Redirect to Discord OAuth
4. User authorizes app on Discord
5. Discord returns to /api/auth/callback/discord
6. better-auth creates user session
7. User redirected to original page
```

### 2. Blog Admin Access Flow

```
1. Authenticated user visits /blog-admin
2. Middleware checks user.discordId against whitelist
3. If NOT whitelisted → Redirect to /auth/error
4. If whitelisted → Check/create Payload user
5. Set Payload session cookie
6. Allow access to blog admin panel
```

### 3. Automatic User Creation

When a whitelisted Discord user accesses `/blog-admin` for the first time:

```typescript
// Automatically creates Payload user with:
{
  email: discordUser.email,
  name: discordUser.name,
  role: "admin",
  discordId: discordUser.discordId,
  password: randomUUID() // Not used, Discord auth only
}
```

## Blog Admin Panel

### Accessing the Admin Panel

1. **Sign in with Discord** (if not already authenticated)
2. **Navigate to** `http://localhost:3000/blog-admin` (or your production URL)
3. If you're whitelisted, you'll automatically be logged into Payload CMS
4. If not whitelisted, you'll see an error page with your Discord ID

### User Roles

All whitelisted Discord users are created as **admin** role by default, which grants:

- Full access to create, edit, and delete blog posts
- Category management
- Media library access
- User management (can view other blog users)
- Settings access

If you need different permission levels, you can manually change a user's role in Payload:

1. Go to `/blog-admin`
2. Navigate to **Blog Users**
3. Edit the user
4. Change role from "admin" to "editor"

**Editor Role Limitations:**
- Can create and edit their own posts
- Cannot delete posts
- Cannot manage users
- Cannot change site settings

### First-Time Setup

On first deployment:

1. Add your Discord user ID to `BLOG_ADMIN_WHITELIST`
2. Deploy/restart the application
3. Sign in with Discord
4. Visit `/blog-admin`
5. Your Payload admin account will be auto-created

## Security Features

### 1. Discord-Only Authentication

- Email/password authentication is **completely disabled**
- All authentication flows through Discord OAuth
- Leverages Discord's security (2FA, verified emails, etc.)
- Reduces attack surface (no password database to protect)

### 2. Whitelist-Based Access Control

- Blog admin access requires explicit whitelist entry
- Even authenticated Discord users cannot access blog admin without whitelist
- Prevents unauthorized access to CMS
- Easy to revoke access (remove from whitelist)

### 3. Automatic Session Management

- Sessions expire after 7 days (configurable)
- Better-auth handles token refresh
- Payload session tied to Discord session
- Automatic cleanup of expired sessions

### 4. Database-Level Security

- Row Level Security (RLS) policies on all tables
- Service role required for better-auth operations
- Users can only access their own data
- Whitelist table protected by RLS

### 5. Audit Trail

The `blog_admin_whitelist` table includes:
- `discord_id`: User being granted access
- `added_by`: Who granted access
- `notes`: Reason for access
- `created_at`: When access was granted

## API Reference

### Check Blog Admin Access

```typescript
// GET /api/blog-admin-auth
// Returns user's blog admin access status

const response = await fetch('/api/blog-admin-auth');
const data = await response.json();

if (data.success) {
  console.log('User has blog admin access:', data.user);
} else {
  console.log('Access denied:', data.message);
}
```

### Verify Access (POST)

```typescript
// POST /api/blog-admin-auth
// Checks if current user can access blog admin

const response = await fetch('/api/blog-admin-auth', {
  method: 'POST'
});
const data = await response.json();

console.log('Has access:', data.hasAccess);
console.log('Reason:', data.reason);
```

### Programmatic Whitelist Management

```typescript
import {
  addToWhitelist,
  removeFromWhitelist,
  getWhitelistedUsers,
  isDiscordUserWhitelisted
} from '@root/lib/payload-auth';

// Add user to whitelist
await addToWhitelist(
  '123456789012345678',
  'admin@example.com',
  'New team member'
);

// Remove user from whitelist
await removeFromWhitelist('123456789012345678');

// Check if user is whitelisted
const isWhitelisted = await isDiscordUserWhitelisted('123456789012345678');

// Get all whitelisted users
const users = await getWhitelistedUsers();
```

## Troubleshooting

### "Access Denied" Error

**Symptom:** User can sign in with Discord but gets "Access Denied" when visiting `/blog-admin`

**Solutions:**
1. Check if Discord user ID is in `BLOG_ADMIN_WHITELIST` environment variable
2. Check if Discord user ID exists in `blog_admin_whitelist` table
3. Verify environment variables are loaded (restart dev server)
4. Check the error page - it displays the Discord ID for debugging

```sql
-- Manually check whitelist
SELECT * FROM blog_admin_whitelist 
WHERE discord_id = 'YOUR_DISCORD_ID';

-- Check user's blog admin status
SELECT discord_id, is_blog_admin, email 
FROM "user" 
WHERE discord_id = 'YOUR_DISCORD_ID';
```

### "Not authenticated with Discord"

**Symptom:** Immediately redirected to Discord login when accessing any page

**Solutions:**
1. Clear cookies and cache
2. Check `BETTER_AUTH_SECRET` is set
3. Verify Discord OAuth redirect URIs are correct
4. Check database connection (sessions table)

### "Cannot access blog admin" after authentication

**Symptom:** Authenticated with Discord but blog admin doesn't load

**Solutions:**
1. Check browser console for errors
2. Verify `PAYLOAD_SECRET` is set
3. Check database connection for Payload tables
4. Ensure Payload tables exist (run `pnpm dev` to auto-create)

### Discord User ID Not Found

**Symptom:** User signs in but no Discord ID is stored

**Solutions:**
1. Check Discord OAuth scopes include "identify"
2. Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
3. Check better-auth logs for errors
4. Re-authorize the Discord application

```sql
-- Check if user has Discord ID
SELECT id, email, discord_id, name 
FROM "user" 
WHERE email = 'user@example.com';
```

### Whitelist Changes Not Taking Effect

**Symptom:** Added user to whitelist but still gets access denied

**Solutions:**
1. **If using environment variable:** Restart the application
2. **If using database:** Check the entry was inserted correctly
3. Clear user's session and re-authenticate
4. Check both environment variable and database

```sql
-- Verify whitelist entry
SELECT * FROM blog_admin_whitelist 
WHERE discord_id = 'NEW_USER_DISCORD_ID';

-- Force update user's blog admin status
UPDATE "user" 
SET is_blog_admin = true 
WHERE discord_id = 'NEW_USER_DISCORD_ID';
```

## Production Deployment

### Vercel/Netlify

1. Add all environment variables to your deployment platform
2. Ensure `BLOG_ADMIN_WHITELIST` is set with production Discord IDs
3. Update `NEXT_PUBLIC_APP_URL` to production domain
4. Update Discord OAuth redirect URIs to production URLs
5. Deploy

### Docker/VPS

1. Create `.env` file with all required variables
2. Ensure database is accessible from container/server
3. Run database migrations before first start
4. Start application with environment variables loaded

```bash
# Example Docker command
docker run -d \
  --env-file .env \
  -p 3000:3000 \
  your-app-image
```

### Environment Variables Checklist

- [ ] `DISCORD_CLIENT_ID` (production Discord app)
- [ ] `DISCORD_CLIENT_SECRET` (production Discord app)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (production database)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (production database)
- [ ] `DATABASE_URL` (production database)
- [ ] `BETTER_AUTH_SECRET` (secure random string)
- [ ] `PAYLOAD_SECRET` (secure random string)
- [ ] `NEXT_PUBLIC_APP_URL` (production domain)
- [ ] `NEXT_PUBLIC_SERVER_URL` (production domain)
- [ ] `BLOG_ADMIN_WHITELIST` (production Discord user IDs)

## Best Practices

### 1. Whitelist Management

- **Use environment variable** for initial setup and small teams
- **Migrate to database** for production and teams > 5 people
- **Document** why each user has access (use `notes` field)
- **Regular audits** of whitelist (remove ex-team members)

### 2. Security

- **Never commit** `.env.local` or secrets to git
- **Use strong secrets** for `BETTER_AUTH_SECRET` and `PAYLOAD_SECRET`
- **Rotate secrets** periodically (every 90 days recommended)
- **Monitor access** via database logs