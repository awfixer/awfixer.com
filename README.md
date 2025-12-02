# AWFixer.com

Official website and blog for AWFixer and Friends community.

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

Visit http://localhost:3000

**See [`QUICK_START.md`](./QUICK_START.md) for complete setup instructions.**

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **CMS**: PayloadCMS (Blog only)
- **Auth**: Better Auth + Discord OAuth
- **Database**: PostgreSQL/Supabase
- **Analytics**: Vercel Analytics
- **Hosting**: Vercel

## ✨ Features

### Discord Integration
- OAuth authentication with Discord
- Automatic Discord server joining on login
- Community-focused user experience

### PayloadCMS Blog
- Full-featured blog with rich text editor
- Category and tag management
- SEO optimization
- Media library with automatic image resizing
- Draft/publish workflow
- Isolated admin panel at `/blog-admin`

### MDX/Component Architecture
- MDX-based content management
- Reusable component blocks
- Consistent brand identity
- Developer-friendly workflow

## 📁 Project Structure

```
awfixer.com/
├── app/
│   ├── page.tsx              # Homepage
│   ├── blog/                 # Blog (PayloadCMS)
│   │   ├── page.tsx          # Blog listing
│   │   └── [slug]/page.tsx   # Blog posts
│   ├── blog-admin/           # CMS admin panel
│   ├── auth/                 # Auth pages
│   └── api/                  # API routes
├── components/
│   ├── main/                 # Main components
│   │   ├── Auth/             # Auth components
│   │   └── ...
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── auth/                 # Auth utilities
│   └── discord-bot.ts        # Discord integration
├── payload.config.ts         # Blog CMS config
├── auth.ts                   # Better Auth config
└── database/
    └── schema.sql            # Database schema
```

## 📚 Documentation

- **[QUICKSTART_BLOG_ADMIN.md](./QUICKSTART_BLOG_ADMIN.md)** - ⚡ Get blog admin access in 5 minutes
- **[DISCORD_BLOG_ADMIN_SETUP.md](./DISCORD_BLOG_ADMIN_SETUP.md)** - Complete blog admin whitelist guide
- **[QUICK_START.md](./QUICK_START.md)** - Get started in minutes
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Discord integration setup
- **[BLOG_SETUP.md](./BLOG_SETUP.md)** - Blog CMS management guide
- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Authentication details
- **[CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)** - Recent auth changes summary
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical overview

## 🔧 Environment Variables

Required variables for `.env.local`:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://user:password@host:port/database

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Discord Server Integration
DISCORD_SERVER_ID=your_server_id
DISCORD_BOT_TOKEN=your_bot_token

# PayloadCMS
PAYLOAD_SECRET=your_secure_random_string

# Blog Admin Whitelist (Discord user IDs, comma-separated)
BLOG_ADMIN_WHITELIST=123456789012345678,987654321098765432

# Server
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

See [`ENV_SETUP.md`](./ENV_SETUP.md) for detailed setup instructions.

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type check
pnpm types:check

# Lint
pnpm lint
```

## 📝 Blog Admin Access

### Quick Setup

**Blog admin requires Discord authentication + whitelist approval.**

1. Get your Discord user ID:
   - Discord → Settings → Advanced → Enable Developer Mode
   - Right-click your profile → Copy User ID

2. Add to whitelist in `.env.local`:
   ```env
   BLOG_ADMIN_WHITELIST=your_discord_user_id
   ```

3. Run database migration:
   ```bash
   psql $DATABASE_URL -f database/migrations/001_add_blog_admin_whitelist.sql
   ```

4. Restart dev server and sign in with Discord

5. Visit http://localhost:3000/blog-admin

See **[QUICKSTART_BLOG_ADMIN.md](./QUICKSTART_BLOG_ADMIN.md)** for detailed instructions.

### Authentication

- ✅ **Discord-only login** - Email/password authentication is disabled
- ✅ **Whitelist-based access** - Only whitelisted Discord users can access blog admin
- ✅ **Automatic user creation** - Payload users auto-created for whitelisted Discord accounts
- ✅ **Environment variable or database** - Manage whitelist via `.env.local` or database table

See [`DISCORD_BLOG_ADMIN_SETUP.md`](./DISCORD_BLOG_ADMIN_SETUP.md) for complete documentation.

## 🚢 Deployment

Hosted on Vercel with automatic deployments from main branch.

**Production Checklist:**
- ✅ Set all environment variables in Vercel (including `BLOG_ADMIN_WHITELIST`)
- ✅ Update Discord OAuth redirect URLs
- ✅ Configure `NEXT_PUBLIC_SERVER_URL` to production domain
- ✅ Run database migration on production database
- ✅ Add production Discord user IDs to whitelist
- ✅ Test Discord auto-join functionality
- ✅ Verify blog admin access works
- ✅ Initialize blog with first post

## 🤝 Contributing

This is the official AWFixer.com repository. Contributions welcome!

## 📄 License

See LICENSE file for details.

## 🙏 Credits

Inspired by PayloadCMS and built with modern web technologies.

---

**Built with ❤️ by the AWFixer & Friends community**
