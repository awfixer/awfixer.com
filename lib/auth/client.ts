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

// Discord sign-in helper
export const signInWithDiscord = () => {
  return signIn.social({
    provider: "discord",
    callbackURL: "/dashboard", // Redirect after successful login
  });
};

// Email/password sign-in helper
export const signInWithCredentials = async (
  email: string,
  password: string,
) => {
  return signIn.email({
    email,
    password,
  });
};

// Sign-up helper
export const signUpWithCredentials = async (
  email: string,
  password: string,
  name?: string,
) => {
  return signUp.email({
    email,
    password,
    name,
  });
};
