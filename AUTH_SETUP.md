# Better-Auth with Discord Setup Guide

This guide will help you set up better-auth with Discord OAuth for your AWFixer project.

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

## 4. Usage Examples

### Basic Authentication Components

```tsx
import { AuthProvider, SignInButton, UserAvatar } from '@components/main/Auth'

// Wrap your app with AuthProvider
function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  )
}

// Use authentication components
function Header() {
  const { isAuthenticated } = useAuth()
  
  return (
    <header>
      {isAuthenticated ? (
        <UserAvatar showName showDropdown />
      ) : (
        <SignInButton>Sign in with Discord</SignInButton>
      )}
    </header>
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
import { useAuth, signInWithDiscord } from '@components/main/Auth'

function LoginForm() {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  if (isAuthenticated) {
    return <div>Welcome back, {user?.name}!</div>
  }
  
  return (
    <button onClick={signInWithDiscord}>
      Sign in with Discord
    </button>
  )
}
```

## 5. Available Auth Components

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

## 6. Protected Routes

Routes are automatically protected by middleware:

- **Protected routes**: `/dashboard`, `/profile`, `/settings`
- **Public routes**: `/`, `/blog`, `/help`, `/auth/*`

To add more protected routes, update the `PROTECTED_ROUTES` array in `middleware.ts`.

## 7. API Reference

### Client-side Hooks and Functions

```tsx
import { 
  useAuth,
  signInWithDiscord,
  signInWithCredentials,
  signUpWithCredentials 
} from '@root/lib/auth'

// Hook for auth state
const { user, session, isLoading, isAuthenticated } = useAuth()

// OAuth sign-in
await signInWithDiscord()

// Email/password authentication
await signInWithCredentials(email, password)
await signUpWithCredentials(email, password, name)
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

## 8. Database Schema

The setup creates these tables in Supabase:

- **user**: User profiles with Discord integration
- **session**: Active user sessions
- **account**: OAuth account connections
- **verification**: Email verification and password reset tokens

## 9. Security Features

- Row Level Security (RLS) policies
- Secure session management
- CSRF protection
- Automatic token refresh
- Secure cookie handling

## 10. Customization

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

### Custom Callbacks

```tsx
// In auth.ts
callbacks: {
  async onSignUp({ user, account }) {
    // Handle new user signup
    console.log('New user:', user.email)
    return true
  },
  async onSignIn({ user, account }) {
    // Handle user sign in
    console.log('User signed in:', user.email)
    return true
  },
}
```

## 11. Production Deployment

1. Update environment variables in your hosting platform
2. Update Discord OAuth redirect URIs for production
3. Ensure Supabase RLS policies are properly configured
4. Test authentication flow in production environment

## 12. Troubleshooting

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

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=better-auth:*
```

## 13. Next Steps

- Set up email verification (optional)
- Configure password reset flow (optional)
- Add additional OAuth providers (GitHub, Google, etc.)
- Implement role-based access control
- Set up webhook handlers for user events

For more information, see the [better-auth documentation](https://www.better-auth.com/docs).