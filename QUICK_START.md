# Quick Start Guide

Get AWFixer.com up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- PostgreSQL or Supabase account
- Discord account (for OAuth and bot setup)

## 1. Clone & Install

```bash
cd awfixer.com
pnpm install
```

## 2. Environment Setup

Create `.env.local` in the project root:

```env
# Database (Supabase or Postgres)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://user:password@host:port/database

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Discord Server Integration (for auto-join)
DISCORD_SERVER_ID=your_discord_server_id
DISCORD_BOT_TOKEN=your_discord_bot_token

# PayloadCMS Blog
PAYLOAD_SECRET=generate_a_secure_random_string_here

# Server URL
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Generate PAYLOAD_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Database Setup

Run the authentication schema:

```bash
# Connect to your database and run:
psql $DATABASE_URL -f database/schema.sql
```

PayloadCMS tables will be created automatically on first run.

## 4. Discord Setup (Quick Version)

### Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Copy **Client ID** and **Client Secret**
4. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Enable **OAuth2 Scopes**: `identify`, `email`, `guilds.join`

### Create Discord Bot
1. In your Discord app, go to "Bot" section
2. Click "Reset Token" and copy it
3. Enable required intents if needed
4. Generate invite URL with "Manage Server" permission
5. Add bot to your Discord server
6. Get your server ID (Right-click server > Copy Server ID)

**See `ENV_SETUP.md` for detailed Discord instructions**

## 5. Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000

## 6. Initialize Blog CMS

1. Go to http://localhost:3000/blog-admin
2. Create your first admin account:
   - Email: your@email.com
   - Password: Choose a strong password
   - Name: Your Name
3. Start creating content!

## Quick Links

- **Homepage**: http://localhost:3000
- **Blog**: http://localhost:3000/blog
- **Blog Admin**: http://localhost:3000/blog-admin
- **Help/Docs**: http://localhost:3000/help/docs

## Common Issues

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Ensure database is running
- Check firewall/network settings

### Discord OAuth Not Working
- Verify redirect URL matches exactly
- Check Client ID and Secret
- Ensure scopes include `guilds.join`

### Blog Admin Won't Load
- Ensure `PAYLOAD_SECRET` is set
- Check `DATABASE_URL` connection
- Clear browser cache

### Images Not Uploading
- Verify `sharp` is installed: `pnpm add sharp`
- Check `public/blog-media` directory exists
- Ensure write permissions

## Next Steps

1. ✅ Create your first blog post
2. ✅ Set up blog categories
3. ✅ Upload some images to media library
4. ✅ Test Discord authentication
5. ✅ Verify auto-join to Discord server

## Production Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_SERVER_URL` to production domain
- [ ] Add production redirect URLs to Discord app
- [ ] Use separate Discord app for production (recommended)
- [ ] Set strong `PAYLOAD_SECRET`
- [ ] Configure environment variables in hosting platform
- [ ] Test Discord auto-join functionality
- [ ] Create initial blog content
- [ ] Set up database backups
- [ ] Configure CDN for media files (optional)

## Documentation

For detailed information, see:

- **`ENV_SETUP.md`** - Complete Discord integration guide
- **`BLOG_SETUP.md`** - Comprehensive blog management guide
- **`AUTH_SETUP.md`** - Authentication system details
- **`IMPLEMENTATION_SUMMARY.md`** - Full technical overview

## Support

- Check documentation files for detailed guides
- Review error messages in console
- Verify all environment variables are set
- Test database connection independently

## Architecture Overview

```
awfixer.com/
├── app/
│   ├── page.tsx              # Homepage
│   ├── blog/                 # Blog frontend
│   │   ├── page.tsx          # Blog listing
│   │   └── [slug]/page.tsx   # Blog post
│   ├── blog-admin/           # PayloadCMS admin
│   │   └── [[...segments]]/  # Admin routes
│   ├── auth/                 # Auth pages
│   └── api/                  # API routes
├── components/
│   ├── main/Auth/            # Auth components
│   └── ui/                   # UI components
├── lib/
│   ├── auth/                 # Auth utilities
│   └── discord-bot.ts        # Discord integration
├── payload.config.ts         # Blog CMS config
├── auth.ts                   # Better Auth config
└── database/
    └── schema.sql            # Auth database schema
```

## Key Features

✨ **Discord Integration**
- OAuth authentication
- Auto-join to Discord server
- Community notices

✨ **PayloadCMS Blog**
- Rich text editor
- Media library
- Categories & tags
- SEO optimization
- Draft/publish workflow

✨ **Modern Stack**
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase/Postgres
- Better Auth

## Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

---

**Ready to start?** Run `pnpm dev` and visit http://localhost:3000! 🚀