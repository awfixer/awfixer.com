// Auth components barrel export
export { AuthProvider, useAuthContext } from "./AuthProvider";
export { SignInButton, DiscordAuthWall } from "./SignInButton";
export { SignOutButton } from "./SignOutButton";
export { UserAvatar } from "./UserAvatar";
export {
  AuthWall,
  BlogAuthWall,
  DocsAuthWall,
  DashboardAuthWall,
} from "./AuthWall";

// Re-export auth utilities for convenience
export {
  useAuth,
  signInWithDiscord,
  redirectToDiscordAuth,
  needsProfileCompletion,
  AUTH_ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  SITE_PROTECTION_ENABLED,
} from "@root/lib/auth";
export type { Session, User } from "@root/auth";
