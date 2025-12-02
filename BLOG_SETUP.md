# Blog Setup Documentation

This document provides instructions for setting up and managing the PayloadCMS-powered blog on AWFixer.com.

## Overview

The blog is a self-contained module within the AWFixer monorepo, powered by PayloadCMS. It features:

- Full-featured blog with rich text editing (Lexical editor)
- Category and tag management
- Featured posts
- SEO optimization
- Media library with automatic image resizing
- Draft and published states
- Related posts functionality
- Isolated admin panel at `/blog-admin`

## Environment Variables

Add these variables to your `.env.local` file:

```env
# PayloadCMS Secret (generate a secure random string)
PAYLOAD_SECRET=your-very-secure-random-string-here

# Database URL (reuses your existing Supabase/Postgres connection)
DATABASE_URL=postgresql://user:password@host:port/database

# Server URL
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Optional: For production
# NEXT_PUBLIC_SERVER_URL=https://awfixer.com
```

### Generating PAYLOAD_SECRET

Generate a secure secret with one of these commands:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Or use any password generator with at least 32 characters
```

## Database Setup

PayloadCMS will automatically create its tables in your existing Postgres/Supabase database. The tables are prefixed with `payload_` to avoid conflicts with your auth tables.

### Initial Migration

On first run, Payload will create these tables:
- `payload_blog_posts`
- `payload_blog_categories`
- `payload_blog_media`
- `payload_blog_users`
- And other internal Payload tables

No manual migration required - Payload handles this automatically!

## First-Time Setup

### 1. Install Dependencies

Dependencies are already included in `package.json`. If you need to reinstall:

```bash
pnpm install
```

### 2. Set Environment Variables

Copy `.env.example` to `.env.local` and add the required variables listed above.

### 3. Start Development Server

```bash
pnpm dev
```

### 4. Access Blog Admin

Navigate to: `http://localhost:3000/blog-admin`

On first visit, you'll be prompted to create an admin account.

### 5. Create Your First Admin User

Fill out the registration form:
- **Email**: your-email@example.com
- **Password**: Choose a strong password
- **Name**: Your Name
- **Role**: Will default to "editor", can be changed to "admin"

## Creating Content

### Creating a Blog Post

1. Go to `/blog-admin`
2. Click "Blog Posts" in the sidebar
3. Click "Create New"
4. Fill out the form:
   - **Title**: Your post title (required)
   - **Slug**: Auto-generated from title, or customize (required)
   - **Excerpt**: Short description for cards and SEO (required)
   - **Content**: Write your post using the rich text editor
   - **Featured Image**: Upload or select from media library
   - **Author**: Select yourself or another user
   - **Categories**: Assign one or more categories
   - **Tags**: Add relevant tags
   - **Status**: Choose "Draft" or "Published"
   - **Featured**: Check to show on homepage
   - **Published At**: Set publish date (auto-set if empty)
   - **Read Time**: Auto-calculated, or set manually

5. Click "Save" or "Save and Publish"

### Creating Categories

1. Go to `/blog-admin`
2. Click "Blog Categories" in the sidebar
3. Click "Create New"
4. Fill out:
   - **Name**: Category name (e.g., "Tutorials")
   - **Slug**: Auto-generated or customize (e.g., "tutorials")
   - **Description**: Optional description
   - **Color**: Hex color code for badge (e.g., #3B82F6)

### Managing Media

1. Go to `/blog-admin`
2. Click "Blog Media" in the sidebar
3. Upload images by dragging or clicking "Upload"
4. For each image:
   - **Alt Text**: Required for accessibility and SEO
   - **Caption**: Optional caption

Images are automatically resized to:
- **Thumbnail**: 400x300px
- **Card**: 768x432px
- **Feature**: 1200x630px (ideal for social sharing)

## User Roles

### Admin
- Full access to all content
- Can create, edit, and delete all posts
- Can manage users
- Can delete categories and media

### Editor
- Can create and edit their own posts
- Can manage categories
- Can upload media
- Cannot delete content or manage users

## Blog Structure

### Frontend Pages

- **`/blog`** - Blog listing page with category filtering
- **`/blog/[slug]`** - Individual blog post pages
- **`/blog-admin`** - CMS admin panel (protected)

### Collections

#### Blog Posts (`blog-posts`)
Main blog content with full rich text editing, categories, tags, SEO fields, and versioning.

#### Blog Categories (`blog-categories`)
Organize posts into categories with custom colors.

#### Blog Media (`blog-media`)
Centralized media library for images with automatic resizing.

#### Blog Users (`blog-users`)
Separate user system for blog authors (independent from main auth).

## SEO Features

Each blog post includes:
- **Meta Title**: Override default title for search engines
- **Meta Description**: Custom description for search results
- **Meta Image**: Custom social share image (OG image)
- Auto-generated structured data
- Sitemap integration (if configured)
- Optimized images with next/image

## Best Practices

### Writing Posts

1. **Use descriptive titles** - Clear, engaging, and SEO-friendly
2. **Write compelling excerpts** - This shows in cards and search results
3. **Add featured images** - Visual content increases engagement
4. **Choose relevant categories** - Helps users find related content
5. **Use tags wisely** - 3-5 tags per post is ideal
6. **Set read time** - Auto-calculated, but verify accuracy
7. **Preview before publishing** - Use draft status to review

### Images

1. **Optimize before upload** - Compress images to reduce file size
2. **Use descriptive alt text** - Important for accessibility and SEO
3. **Recommended dimensions**:
   - Featured images: 1200x630px (16:9 ratio)
   - In-content images: 800-1200px wide
4. **Supported formats**: JPEG, PNG, WebP, GIF

### Categories vs Tags

- **Categories**: Broad topics (3-7 total recommended)
  - Examples: "Tutorials", "News", "Updates", "Guides"
  
- **Tags**: Specific topics (use freely)
  - Examples: "javascript", "docker", "authentication", "performance"

## Troubleshooting

### "Cannot connect to database"

1. Verify `DATABASE_URL` is correct in `.env.local`
2. Ensure your database is running
3. Check database credentials and permissions

### "Payload secret is not set"

Add `PAYLOAD_SECRET` to your `.env.local` file. Generate one using the commands above.

### "Cannot access /blog-admin"

1. Ensure development server is running
2. Clear browser cache and cookies
3. Check console for errors
4. Verify Payload config is correct

### Images not uploading

1. Check `public/blog-media` directory exists and is writable
2. Verify `sharp` package is installed: `pnpm add sharp`
3. Check file size limits (default: 5MB)

### Posts not showing on /blog

1. Verify post status is set to "Published"
2. Check that `publishedAt` date is not in the future
3. Ensure database connection is working
4. Check server logs for errors

## Production Deployment

### Vercel Deployment

1. Add environment variables to Vercel project settings
2. Add `DATABASE_URL` and `PAYLOAD_SECRET`
3. Set `NEXT_PUBLIC_SERVER_URL` to your production domain
4. Deploy as normal

### Other Platforms

1. Ensure environment variables are set
2. Build the project: `pnpm build`
3. Start production server: `pnpm start`
4. Ensure `public/blog-media` directory is persistent

## API Access

PayloadCMS provides REST and GraphQL APIs:

### REST API
- **Base URL**: `/blog-admin/api`
- **Posts**: `/blog-admin/api/blog-posts`
- **Categories**: `/blog-admin/api/blog-categories`
- **Media**: `/blog-admin/api/blog-media`

### GraphQL
- **Endpoint**: `/blog-admin/graphql`
- **Playground**: `/blog-admin/graphql-playground`

Authentication required for write operations.

## Backup and Migration

### Exporting Content

Use Payload's built-in export functionality:

```bash
# Export all collections
npx payload export
```

### Importing Content

```bash
# Import from export file
npx payload import --file=path/to/export.json
```

## Support

For issues specific to:
- **PayloadCMS**: https://payloadcms.com/docs
- **This implementation**: Check project issues or contact team

## Security Notes

1. **Never commit** `.env.local` or expose `PAYLOAD_SECRET`
2. **Use strong passwords** for blog admin accounts
3. **Regularly update** dependencies for security patches
4. **Limit admin access** to trusted team members only
5. **Enable 2FA** for production admin accounts (if available)

## Future Enhancements

Potential features to add:
- Comments system
- Newsletter integration
- RSS feed
- Advanced search
- Author profiles
- Post series/collections
- Reading progress indicator
- Social share buttons
- Analytics integration