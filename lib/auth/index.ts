// Export all auth utilities and types
export { auth } from "@root/auth";
export type { Session, User } from "@root/auth";

// Client-side exports
export {
  authClient,
  useAuth,
  signInWithDiscord,
  signInWithCredentials,
  signUpWithCredentials,
} from "./client";

// Server-side exports
export {
  getSession,
  getCurrentUser,
  requireAuth,
  isAuthenticated,
  getUserById,
  signOut as serverSignOut,
} from "./server";

// Common auth constants
export const AUTH_ROUTES = {
  DISCORD_SIGN_IN: "/api/auth/sign-in/discord",
  CALLBACK: "/api/auth/callback",
  DISCORD_CALLBACK: "/api/auth/callback/discord",
  COMPLETE_PROFILE: "/auth/complete-profile",
} as const;

// Only the homepage is public - everything else requires Discord auth
export const PUBLIC_ROUTES = [
  "/", // Main homepage only
] as const;

// All routes except homepage require authentication
export const PROTECTED_ROUTES = [
  "/blog",
  "/help",
  "/help/docs",
  "/dashboard",
  "/profile",
  "/settings",
] as const;

// Site-wide protection policy: Discord auth required for all content
export const SITE_PROTECTION_ENABLED = true;
