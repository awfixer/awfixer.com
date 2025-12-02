import { auth } from "@root/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Session, User } from "@root/auth";

/**
 * Get the current session on the server side
 * Returns null if no session exists
 */
export const getSession = async (): Promise<Session | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
};

/**
 * Get the current user on the server side
 * Returns null if no user is authenticated
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getSession();
  return session?.user || null;
};

/**
 * Require authentication - redirects to login if not authenticated
 * Use in server components or server actions
 */
export const requireAuth = async (
  redirectTo = "/auth/sign-in",
): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session?.user;
};

/**
 * Get user by ID (admin function)
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await auth.api.getUser({
      headers: await headers(),
      body: { id },
    });
    return user;
  } catch (error) {
    console.error("Failed to get user by ID:", error);
    return null;
  }
};

/**
 * Sign out user server-side
 */
export const signOut = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Failed to sign out:", error);
  }
};
