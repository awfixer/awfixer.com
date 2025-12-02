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

- **[QUICK_START.md](./QUICK_START.md)** - Get started in minutes
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Discord integration setup
- **[BLOG_SETUP.md](./BLOG_SETUP.md)** - Blog CMS management guide
- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Authentication details
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

## 📝 Creating Blog Content

1. Start development server: `pnpm dev`
2. Visit http://localhost:3000/blog-admin
3. Create your admin account
4. Start writing posts!

See [`BLOG_SETUP.md`](./BLOG_SETUP.md) for comprehensive guide.

## 🚢 Deployment

Hosted on Vercel with automatic deployments from main branch.

**Production Checklist:**
- ✅ Set all environment variables in Vercel
- ✅ Update Discord OAuth redirect URLs
- ✅ Configure `NEXT_PUBLIC_SERVER_URL` to production domain
- ✅ Test Discord auto-join functionality
- ✅ Initialize blog with first post

## 🤝 Contributing

This is the official AWFixer.com repository. Contributions welcome!

## 📄 License

See LICENSE file for details.

## 🙏 Credits

Inspired by PayloadCMS and built with modern web technologies.

---

**Built with ❤️ by the AWFixer & Friends community**
