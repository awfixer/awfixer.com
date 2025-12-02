# Quick Start: Blog Admin Access

Get blog admin access working in 5 minutes.

## Prerequisites

- Supabase or PostgreSQL database
- Discord Developer Application
- Node.js 22+ and pnpm 10+

## Step 1: Get Your Discord User ID

1. Open Discord → **User Settings** (⚙️)
2. Go to **Advanced** → Enable **Developer Mode**
3. Right-click your profile → **Copy User ID**
4. Save this ID (e.g., `123456789012345678`)

## Step 2: Update Environment Variables

Add to your `.env.local`:

```env
# Add your Discord user ID to the whitelist
BLOG_ADMIN_WHITELIST=123456789012345678

# Make sure these are set:
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
PAYLOAD_SECRET=your_secure_random_string
DATABASE_URL=postgresql://user:password@host:port/database
```

If you need to add multiple admins, separate IDs with commas (no spaces):
```env
BLOG_ADMIN_WHITELIST=123456789012345678,987654321098765432
```

## Step 3: Run Database Migration

### Option A: Using psql (Recommended)

```bash
psql $DATABASE_URL -f database/migrations/001_add_blog_admin_whitelist.sql
```

### Option B: Using Supabase SQL Editor

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `database/migrations/001_add_blog_admin_whitelist.sql`
4. Paste and **Run**

### Option C: Using Setup Script

```bash
chmod +x scripts/setup-blog-admin.sh
./scripts/setup-blog-admin.sh
```

The script will guide you through the entire setup process.

## Step 4: Restart Development Server

```bash
# Kill existing server (Ctrl+C)
# Then restart:
pnpm dev
```

**Important:** The application MUST be restarted for `BLOG_ADMIN_WHITELIST` changes to take effect.

## Step 5: Sign In and Access Blog Admin

1. Go to `http://localhost:3000`
2. Click "Sign in with Discord" (or visit any protected page)
3. Authorize the Discord app
4. Once signed in, visit `http://localhost:3000/blog-admin`
5. ✅ You should now have access to the Payload CMS admin panel!

## Troubleshooting

### "Access Denied" Error

**Check 1:** Is your Discord ID in the whitelist?
```bash
# View your .env.local
cat .env.local | grep BLOG_ADMIN_WHITELIST
```

**Check 2:** Did you restart the server after adding the ID?
```bash
# Stop server (Ctrl+C) and restart
pnpm dev
```

**Check 3:** Get your Discord ID from the database
```sql
SELECT discord_id, email, name FROM "user" WHERE email = 'your@email.com';
```

Copy the `discord_id` value and add it to `BLOG_ADMIN_WHITELIST`.

**Check 4:** Verify database migration ran successfully
```sql
-- This should return columns including is_blog_admin
\d "user"

-- This should return the table structure
\d "blog_admin_whitelist"
```

### "Cannot Connect to Database"

**Fix:**
1. Verify `DATABASE_URL` in `.env.local`
2. Test connection:
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

### Multiple Admins Not Working

**Fix:** Ensure no spaces after commas:
```env
# ❌ Wrong (has spaces)
BLOG_ADMIN_WHITELIST=123456789, 987654321

# ✅ Correct (no spaces)
BLOG_ADMIN_WHITELIST=123456789,987654321
```

### Migration Already Run

If you get "relation already exists" errors, the migration was already applied. This is safe to ignore.

To verify:
```sql
-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user' AND column_name = 'is_blog_admin';

-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'blog_admin_whitelist';
```

## Verify Setup

### Test 1: Check Whitelist in Database

```sql
-- Add yourself to database whitelist (alternative to env var)
INSERT INTO blog_admin_whitelist (discord_id, notes)
VALUES ('123456789012345678', 'Primary admin')
ON CONFLICT (discord_id) DO NOTHING;
```

### Test 2: Check Your User Record

```sql
-- After signing in with Discord, check your user
SELECT 
    discord_id, 
    email, 
    name, 
    is_blog_admin 
FROM "user" 
WHERE discord_id = '123456789012345678';
```

Should show `is_blog_admin = true` after accessing `/blog-admin`.

### Test 3: API Check

```bash
# Check blog admin access via API
curl http://localhost:3000/api/blog-admin-auth \
  -H "Cookie: your-session-cookie"
```

Should return:
```json
{
  "success": true,
  "message": "Blog admin access granted",
  "user": { ... }
}
```

## Adding More Admins

### Method 1: Environment Variable (Simple)

1. Get their Discord user ID
2. Add to `.env.local`:
```env
BLOG_ADMIN_WHITELIST=your_id,their_id,another_id
```
3. Restart server

### Method 2: Database (Advanced)

```sql
-- Add user to whitelist
INSERT INTO blog_admin_whitelist (discord_id, added_by, notes)
VALUES (
    '987654321098765432',
    'admin@example.com',
    'New team member - content editor'
);

-- User will have access immediately (no restart needed)
```

### Method 3: Programmatic (Future)

```typescript
import { addToWhitelist } from '@root/lib/payload-auth';

await addToWhitelist(
    '987654321098765432',
    'admin@example.com',
    'New team member'
);
```

## Next Steps

Now that you have blog admin access:

1. **Create your first blog post:**
   - Go to `/blog-admin`
   - Click **Blog Posts** → **Create New**
   - Fill in title, content, and publish

2. **Create categories:**
   - Click **Blog Categories** → **Create New**
   - Add categories like "Tutorials", "News", etc.

3. **Upload media:**
   - Click **Blog Media** → **Upload**
   - Add images for your blog posts

4. **Add more admins:**
   - Get their Discord user IDs
   - Add to whitelist using methods above

5. **Customize roles:**
   - Go to **Blog Users**
   - Change role from "admin" to "editor" for limited access

## Production Deployment

### Before Deploying:

1. **Update environment variables** on your hosting platform:
   - Add `BLOG_ADMIN_WHITELIST` with production Discord IDs
   - Ensure all other variables are set

2. **Update Discord OAuth:**
   - Add production redirect URI: `https://yourdomain.com/api/auth/callback/discord`

3. **Run migration on production database:**
```bash
psql $PRODUCTION_DATABASE_URL -f database/migrations/001_add_blog_admin_whitelist.sql
```

4. **Test access:**
   - Sign in with Discord on production
   - Verify blog admin access works

## Common Commands

```bash
# Restart dev server
pnpm dev

# Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# View environment variables
cat .env.local

# Run migration
psql $DATABASE_URL -f database/migrations/001_add_blog_admin_whitelist.sql

# Check user's Discord ID
psql $DATABASE_URL -c "SELECT discord_id, email FROM \"user\";"

# Add to whitelist via SQL
psql $DATABASE_URL -c "INSERT INTO blog_admin_whitelist (discord_id, notes) VALUES ('123456789', 'Admin') ON CONFLICT DO NOTHING;"
```

## Getting Help

- **Detailed docs:** See `DISCORD_BLOG_ADMIN_SETUP.md`
- **Auth setup:** See `AUTH_SETUP.md`
- **Blog setup:** See `BLOG_SETUP.md`
- **Changes summary:** See `CHANGES_SUMMARY.md`

## Summary

✅ Discord-only authentication (no email/password)
✅ Whitelist-based blog admin access
✅ Automatic Payload user creation
✅ Environment variable OR database whitelist
✅ Easy to add/remove admins
✅ Secure and production-ready

**You're all set! Happy blogging! 🎉**