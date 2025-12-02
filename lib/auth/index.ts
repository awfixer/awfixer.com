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
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  CALLBACK: "/api/auth/callback",
  DISCORD_CALLBACK: "/api/auth/callback/discord",
} as const;

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/settings",
] as const;

export const PUBLIC_ROUTES = [
  "/",
  "/blog",
  "/help",
  "/help/docs",
  "/auth/sign-in",
  "/auth/sign-up",
] as const;
