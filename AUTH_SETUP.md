# Site-Wide Discord Authentication Setup Guide

This guide will help you set up mandatory Discord authentication for your AWFixer project. **All pages except the homepage require Discord authentication** to prevent scraping and protect content.

## Prerequisites

- Supabase account and project
- Discord Developer account
- Node.js 18+ and pnpm

## 1. Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "AWFixer")
3. Go to the "OAuth2" tab in your application
4. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/discord` (development)
   - `https://yourdomain.com/api/auth/callback/discord` (production)
5. Copy your Client ID and Client Secret

## 2. Supabase Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Run the schema from `database/schema.sql`
3. This will create the required tables: `user`, `session`, `account`, and `verification`

## 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
BETTER_AUTH_SECRET=your_random_secret_key_here

# Optional
BETTER_AUTH_URL=http://localhost:3000
```

Generate a secure secret for `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

## 4. Site Protection Policy

### Authentication Requirements
- **Homepage (`/`)**: Public access (no authentication required)
- **All other pages**: Discord authentication mandatory
- **Blog, Help, Documentation**: Protected behind Discord auth
- **API routes**: `/api/auth/*` excluded from protection
- **Static assets**: CSS, JS, images excluded from protection

### Middleware Protection
The middleware automatically:
- Redirects unauthenticated users to Discord OAuth
- Preserves return URLs for seamless post-auth navigation
- Handles profile completion flow for new users
- Protects against scraping and unauthorized access

## 5. Usage Examples

### Basic Authentication Components

```tsx
import { AuthProvider, SignInButton, UserAvatar, AuthWall } from '@components/main/Auth'

// Wrap your app with AuthProvider (required)
function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  )
}

// Auth wall for protected content (fallback)
function ProtectedPage() {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <AuthWall title="Access Restricted" />
  }
  
  return <YourProtectedContent />
}

// Homepage component (public)
function Homepage() {
  return (
    <div>
      <h1>Welcome to AWFixer</h1>
      <SignInButton>Join Discord Community</SignInButton>
    </div>
  )
}
```

### Server-side Authentication

```tsx
import { getCurrentUser, requireAuth } from '@root/lib/auth'

// Get current user (optional)
export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Please sign in</div>
  }
  
  return <div>Welcome, {user.name}!</div>
}

// Require authentication (redirects if not authenticated)
export default async function DashboardPage() {
  const user = await requireAuth() // Automatically redirects if not authenticated
  
  return <div>Protected content for {user.name}</div>
}
```

### Client-side Authentication

```tsx
'use client'
import { useAuth, signInWithDiscord, AuthWall } from '@components/main/Auth'

function ProtectedContent() {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  if (!isAuthenticated) {
    return <AuthWall title="Authentication Required" />
  }
  
  return (
    <div>
      <h1>Welcome back, {user?.name}!</h1>
      <p>This content is protected from scraping.</p>
    </div>
  )
}

// Direct Discord sign-in (redirects immediately)
function QuickSignIn() {
  return (
    <button onClick={() => signInWithDiscord()}>
      Sign in with Discord
    </button>
  )
}
```

## 6. Available Auth Components

### `<AuthProvider>`
Wrap your app to provide authentication context.

### `<SignInButton>`
```tsx
<SignInButton 
  variant="default" 
  size="lg" 
  redirectTo="/dashboard"
>
  Sign in with Discord
</SignInButton>
```

### `<SignOutButton>`
```tsx
<SignOutButton 
  variant="ghost" 
  redirectTo="/"
>
  Sign Out
</SignOutButton>
```

### `<UserAvatar>`
```tsx
<UserAvatar 
  size="lg" 
  showName={true} 
  showDropdown={true} 
/>
```

### `<AuthWall>` and Variants
```tsx
// Generic auth wall
<AuthWall 
  title="Authentication Required" 
  message="Sign in with Discord to continue" 
/>

// Specific variants
<BlogAuthWall />
<DocsAuthWall />
<DashboardAuthWall />
```

## 7. Site-Wide Protection

**All routes except homepage require Discord authentication:**

- **Public routes**: `/` (homepage only)
- **Protected routes**: Everything else (`/blog`, `/help`, `/dashboard`, etc.)
- **System routes**: Static assets and auth APIs are excluded

The middleware handles protection automatically. No manual route configuration needed.

## 8. API Reference

### Client-side Hooks and Functions

```tsx
import { 
  useAuth,
  signInWithDiscord,
  redirectToDiscordAuth,
  needsProfileCompletion
} from '@root/lib/auth'

// Hook for auth state
const { user, session, isLoading, isAuthenticated } = useAuth()

// Discord OAuth sign-in (redirects immediately)
signInWithDiscord(callbackUrl)

// Alternative redirect method
redirectToDiscordAuth(returnUrl)

// Check if user needs profile completion
const needsCompletion = needsProfileCompletion(user)
```

### Server-side Functions

```tsx
import { 
  getCurrentUser,
  getSession,
  requireAuth,
  isAuthenticated 
} from '@root/lib/auth/server'

// Get current user/session
const user = await getCurrentUser()
const session = await getSession()

// Check authentication
const authenticated = await isAuthenticated()

// Require authentication (redirects if not authenticated)
const user = await requireAuth('/auth/sign-in')
```

## 9. Database Schema

The setup creates these tables in Supabase:

- **user**: User profiles with Discord integration
- **session**: Active user sessions
- **account**: OAuth account connections
- **verification**: Email verification and password reset tokens

## 10. Security Features

### Site-Wide Protection
- **Mandatory Discord authentication** for all content
- **Scraping prevention** through auth gates
- **Community-based access control**
- **Profile completion enforcement**

### Technical Security

- Row Level Security (RLS) policies
- Secure session management
- CSRF protection
- Automatic token refresh
- Secure cookie handling

## 11. Profile Completion Flow

New Discord users are automatically redirected to complete their profile:

1. User signs in with Discord
2. If `name` or `username` is missing, redirect to `/auth/complete-profile`
3. User completes required profile fields
4. User is redirected to original destination

### Custom Profile Fields
Add fields to the completion form by updating:
- `app/auth/complete-profile/page.tsx`
- `app/api/auth/update-profile/route.ts`
- Database schema

## 12. Customization

### Custom User Fields

Add custom fields to the user table and update the auth configuration:

```sql
ALTER TABLE "user" ADD COLUMN custom_field TEXT;
```

```tsx
// In auth.ts
user: {
  additionalFields: {
    customField: {
      type: "string",
      required: false,
    },
  },
}
```

### Custom Protection Rules

```tsx
// In middleware.ts - modify protection logic
const isProtectedRoute = (pathname: string) => {
  // Only homepage is public
  if (pathname === '/') return false
  
  // Add custom public routes if needed
  const customPublicRoutes = ['/special-public-page']
  if (customPublicRoutes.includes(pathname)) return false
  
  // Everything else requires auth
  return true
}
```

### Custom Auth Walls

```tsx
// Create custom auth wall variants
export function CustomAuthWall() {
  return (
    <AuthWall
      title="Custom Access Required"
      message="Your custom message here"
      className="custom-styling"
    />
  )
}
```

## 13. Production Deployment

1. Update environment variables in your hosting platform
2. Update Discord OAuth redirect URIs for production
3. Ensure Supabase RLS policies are properly configured
4. Test authentication flow in production environment

## 14. Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Check Discord OAuth settings
- Ensure redirect URI matches exactly (including trailing slashes)

**"Database connection failed"**
- Verify Supabase credentials
- Check if database schema is properly set up
- Ensure RLS policies allow service role access

**"Session not found"**
- Check if cookies are being set properly
- Verify BETTER_AUTH_SECRET is set
- Check if middleware is running correctly

**"User bypassing auth wall"**
- Check middleware configuration
- Verify route patterns in middleware config
- Ensure auth wall components are properly implemented

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=better-auth:*
NODE_ENV=development
```

### Testing Protection

Test your protection by:
1. Opening incognito browser
2. Trying to access `/blog` or `/help` directly
3. Should redirect to Discord OAuth
4. After auth, should return to original page

## 15. Next Steps

### Enhanced Protection
- Implement rate limiting for auth endpoints
- Add CAPTCHA for suspicious traffic
- Set up IP-based blocking for persistent scrapers

### Community Features
- Role-based access within Discord community
- Premium content tiers based on Discord roles
- Community-specific features and permissions

### Monitoring
- Track authentication metrics
- Monitor for scraping attempts
- Set up alerts for unusual access patterns

For more information, see the [better-auth documentation](https://www.better-auth.com/docs).

## 16. Important Notes

⚠️ **This setup provides site-wide protection** - only the homepage is publicly accessible.

✅ **All content is protected** from scraping and unauthorized access.

🔒 **Discord authentication is mandatory** for all users accessing content.

📱 **Mobile-friendly** Discord OAuth flow ensures seamless access across devices.