# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the AWFixer and Friends website - a Next.js 15 application with Payload CMS 3.x headless CMS. The architecture follows a monorepo pattern with frontend routes in `src/app/(frontend)` and CMS admin in `src/app/(payload)`.

**Tech Stack**: Next.js 15.4.7, React 19.1.0, Payload CMS 3.60.0, Vercel Postgres, Vercel Blob Storage, TypeScript 5.7.3, Tailwind CSS

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server at localhost:3000
pnpm dev:prod              # Test production build locally

# Build & Deploy
pnpm build                 # Production build
pnpm ci                    # Clean install + migrate + build (CI/CD)
pnpm start                 # Start production server

# Code Quality
pnpm run typecheck         # TypeScript type checking
pnpm run lint              # ESLint with auto-fix
pnpm run validate:styles   # Validate Tailwind-only styling
pnpm run validate:all      # Run all validation (typecheck + lint + styles)

# Payload CMS
pnpm payload generate:types        # Generate TypeScript types from CMS config
pnpm payload generate:importmap    # Generate import map for admin panel
pnpm payload migrate               # Run database migrations

# Testing
pnpm test                  # Run all tests
pnpm test:int             # Integration tests (Vitest)
pnpm test:e2e             # E2E tests (Playwright)
```

## Architecture Patterns

### Dual App Structure

The application has two distinct app routers:

1. **Frontend (`src/app/(frontend)`)**: Public-facing Next.js app with SSG/ISR
2. **Admin (`src/app/(payload)`)**: Payload CMS admin panel at `/admin`

Both share the same Payload configuration but have separate layouts and routing.

### Static Generation Critical Pattern

**IMPORTANT**: When creating or modifying dynamic routes that use Payload's `generateStaticParams()`, you MUST set `overrideAccess: true` in the query. This is required because:

- Build-time page generation has no authentication context
- Payload's access control (`authenticatedOrPublished`) blocks unauthenticated requests
- Without `overrideAccess: true`, builds fail with 403 errors

```typescript
// ✅ CORRECT - Build will succeed
export async function generateStaticParams() {
  const pages = await payload.find({
    collection: 'pages',
    overrideAccess: true, // Required for build-time access
    draft: false,
  })
}

// ❌ WRONG - Build will fail with 403
export async function generateStaticParams() {
  const pages = await payload.find({
    collection: 'pages',
    overrideAccess: false, // Respects access control, blocks build
  })
}
```

This pattern applies to ALL routes using `generateStaticParams()`:

- `/[slug]/page.tsx` - Pages
- `/posts/[slug]/page.tsx` - Posts
- Sitemap routes in `(sitemaps)/`

### Collections Architecture

**Core Collections** (`src/collections/`):

- `Pages`: Content pages with blocks layout system
- `Posts`: Blog posts with search integration
- `Categories`: Nested category hierarchy
- `Media`: Vercel Blob storage integration
- `Users`: Authentication with TOTP 2FA support

**Access Control Pattern**:

```typescript
// Defined in src/access/
authenticatedOrPublished // Users OR published content
authenticated // Users only
anyone // Public access
```

### Blocks System

Pages and Posts use a composable blocks architecture. Blocks are defined in `src/blocks/`:

- `ArchiveBlock` - Post listings with pagination
- `CallToAction` - CTA sections
- `Content` - Rich text with Lexical editor
- `FormBlock` - Form builder integration
- `MediaBlock` - Images/videos
- `Banner` - Alert/notice banners
- `Code` - Syntax-highlighted code blocks

Each block has:

- `config.ts` - Payload CMS field schema
- `Component.tsx` - React component for rendering

To add a new block, create both files and register in `Pages` and/or `Posts` collection configs.

### Revalidation Hooks

All content changes trigger ISR revalidation via hooks:

```typescript
// src/collections/Pages/hooks/revalidatePage.ts
export const revalidatePage: CollectionAfterChangeHook = async ({ doc, req }) => {
  revalidatePath(`/${doc.slug}`)
  revalidatePath('/', 'layout')
}
```

This pattern ensures Next.js static pages update when CMS content changes. Similar hooks exist for Posts, Header, Footer, and Redirects.

### Environment Variables

Required for build and runtime (see `.env.example`):

```bash
POSTGRES_URL=              # Vercel Postgres connection string
PAYLOAD_SECRET=            # JWT encryption secret
NEXT_PUBLIC_SERVER_URL=    # Base URL (no trailing slash)
CRON_SECRET=              # Cron job authentication
PREVIEW_SECRET=           # Live preview validation
BLOB_READ_WRITE_TOKEN=    # Vercel Blob storage token
```

## Styling Standards

**Strict Tailwind-Only Policy**: This project enforces Tailwind CSS exclusively. The `validate:styles` script checks for:

- ❌ No SCSS/CSS imports (except in `src/app/(payload)` for admin)
- ❌ No CSS modules
- ❌ No CSS-in-JS libraries (styled-components, emotion)
- ⚠️ Inline styles discouraged (warnings only, allowed for dynamic values)

Use `cn()` utility from `src/utilities/ui.ts` for conditional classes:

```typescript
import { cn } from '@/utilities/ui'

<div className={cn('base-class', isActive && 'active-class')} />
```

## Plugin Configuration

Payload plugins configured in `src/plugins/index.ts`:

- **Redirects Plugin**: Auto-revalidation on redirect changes, requires rebuild when `from` field changes
- **Nested Docs Plugin**: Category hierarchy with slug-based URLs
- **SEO Plugin**: Meta tags with auto-generation
- **Form Builder Plugin**: Contact/lead forms with Lexical editor
- **Search Plugin**: Full-text search for posts with custom field overrides
- **TOTP Plugin**: Two-factor authentication (SHA256, 6 digits, 30s period)

## Git Workflow & Precommit Hooks

Husky + lint-staged configured for pre-commit validation:

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,scss}": ["prettier --write"]
}
```

Changes are automatically linted and formatted on commit. Commits will fail if linting errors remain.

## Common Patterns

### Querying Payload Data

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const payload = await getPayload({ config: configPromise })

// Cache queries in server components
const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  return await payload.find({
    collection: 'pages',
    draft, // Enable draft mode if previewing
    overrideAccess: draft, // Override access control in draft mode
    where: { slug: { equals: slug } },
  })
})
```

### Live Preview Integration

Draft mode + live preview enabled for Pages and Posts:

```typescript
// In page.tsx
import { LivePreviewListener } from '@/components/LivePreviewListener'

export default async function Page() {
  const { isEnabled: draft } = await draftMode()

  return (
    <>
      {draft && <LivePreviewListener />}
      {/* content */}
    </>
  )
}
```

### Theme System

Theme provider with light/dark/auto modes:

```typescript
'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'

const { setHeaderTheme } = useHeaderTheme()
useEffect(() => {
  setHeaderTheme('dark') // or 'light'
}, [])
```

## Build & CI/CD

The `pnpm ci` command is designed for clean builds in CI/CD:

1. Removes `.next`, `node_modules`, `pnpm-lock.yaml`
2. Fresh `pnpm install`
3. Runs database migrations
4. Production build

Use locally to troubleshoot build issues or before major deployments.

## Key File Locations

```
src/
├── app/
│   ├── (frontend)/           # Public Next.js app
│   │   ├── [slug]/page.tsx  # Dynamic pages (MUST use overrideAccess: true)
│   │   ├── posts/           # Blog routes
│   │   └── layout.tsx       # Root layout with Header/Footer
│   └── (payload)/           # CMS admin routes
├── collections/             # Payload collections (data models)
├── blocks/                  # Composable content blocks
├── heros/                   # Hero section variants
├── access/                  # Access control rules
├── plugins/                 # Payload plugin configuration
├── utilities/               # Shared utilities
└── payload.config.ts        # Main Payload configuration
```

## Database Migrations

Migrations stored in `src/migrations/`. Generated via:

```bash
pnpm payload migrate:create
```

Migrations auto-run on `pnpm ci` and production deployments. Never modify migration files manually.
