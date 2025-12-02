'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignInButton } from './SignInButton'

interface AuthWallProps {
  title?: string
  message?: string
  showReturnButton?: boolean
  className?: string
}

export function AuthWall({
  title = "Authentication Required",
  message = "You must sign in with Discord to access this content.",
  showReturnButton = true,
  className = "",
}: AuthWallProps) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Discord auth after a short delay if user doesn't interact
    const timer = setTimeout(() => {
      window.location.href = `/api/auth/sign-in/discord?callbackUrl=${encodeURIComponent(window.location.pathname)}`
    }, 10000) // 10 seconds

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
          {/* Lock Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
          </div>

          {/* Discord Auth Button */}
          <SignInButton
            size="lg"
            className="w-full mb-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            callbackUrl={typeof window !== 'undefined' ? window.location.pathname : undefined}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 127.14 96.36"
              className="fill-current mr-2"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
            Continue with Discord
          </SignInButton>

          {showReturnButton && (
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              ← Return to Homepage
            </button>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Content Protection
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  This content is protected to prevent scraping and ensure quality access.
                  Discord authentication is required for all pages except the homepage.
                </p>
              </div>
            </div>
          </div>

          {/* Auto-redirect notice */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            You'll be automatically redirected to Discord login in a few seconds...
          </p>
        </div>
      </div>
    </div>
  )
}

// Specific variant for blog protection
export function BlogAuthWall() {
  return (
    <AuthWall
      title="Blog Access Restricted"
      message="Sign in with Discord to read our exclusive blog posts and community resources."
    />
  )
}

// Specific variant for help/docs protection
export function DocsAuthWall() {
  return (
    <AuthWall
      title="Documentation Access Required"
      message="Access to our comprehensive documentation and help resources requires Discord authentication."
    />
  )
}

// Specific variant for dashboard/protected areas
export function DashboardAuthWall() {
  return (
    <AuthWall
      title="Dashboard Access Required"
      message="Please authenticate with Discord to access your dashboard and account features."
      showReturnButton={false}
    />
  )
}
