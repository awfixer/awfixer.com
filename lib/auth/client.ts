"use client";

import { createAuthClient } from "better-auth/react";
import type { Session, User } from "@root/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Typed hooks for better TypeScript support
export const useAuth = () => {
  const session = useSession();

  return {
    user: session.data?.user as User | null,
    session: session.data as Session | null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    signIn,
    signUp,
    signOut,
  };
};

// Discord sign-in helper - direct redirect to Discord OAuth
export const signInWithDiscord = (callbackUrl?: string) => {
  const redirectUrl = callbackUrl || window.location.pathname;
  window.location.href = `/api/auth/sign-in/discord?callbackUrl=${encodeURIComponent(redirectUrl)}`;
};

// Check if user needs to complete profile
export const needsProfileCompletion = (user: User | null | undefined) => {
  return !user?.name || !user?.username;
};

// Redirect to Discord auth with return URL
export const redirectToDiscordAuth = (returnUrl?: string) => {
  const callbackUrl = returnUrl || window.location.pathname;
  window.location.href = `/api/auth/sign-in/discord?callbackUrl=${encodeURIComponent(callbackUrl)}`;
};
