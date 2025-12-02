"use client";

import { signInWithDiscord } from "@root/lib/auth/client";
import { Button } from "@components/ui/button";
import { useState } from "react";

interface SignInButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
  callbackUrl?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function SignInButton({
  className,
  children = "Sign in with Discord",
  variant = "default",
  size = "default",
  callbackUrl,
  disabled = false,
  fullWidth = false,
  ...props
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    try {
      setIsLoading(true);
      signInWithDiscord(callbackUrl);
    } catch (error) {
      console.error("Sign in failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={`${className} ${fullWidth ? "w-full" : ""}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Redirecting to Discord...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 127.14 96.36"
            className="fill-current"
          >
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
          {children}
        </div>
      )}
    </Button>
  );
}

// Specific variant for auth walls/gates
export function DiscordAuthWall({
  title = "Authentication Required",
  message = "You must sign in with Discord to access this content.",
  className,
}: {
  title?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${className}`}
    >
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 127.14 96.36"
                className="fill-blue-600 dark:fill-blue-400"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </div>

          <SignInButton size="lg" fullWidth className="mb-4">
            Continue with Discord
          </SignInButton>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            This content is protected to prevent scraping and ensure quality
            access.
          </p>
        </div>
      </div>
    </div>
  );
}
