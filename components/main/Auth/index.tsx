// Auth components barrel export
export { AuthProvider, useAuthContext } from './AuthProvider'
export { SignInButton } from './SignInButton'
export { SignOutButton } from './SignOutButton'
export { UserAvatar } from './UserAvatar'

// Re-export auth utilities for convenience
export {
  useAuth,
  signInWithDiscord,
  signInWithCredentials,
  signUpWithCredentials,
  AUTH_ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
} from '@root/lib/auth'
export type { Session, User } from '@root/auth'
