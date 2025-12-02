import { Suspense } from "react";
import Link from "next/link";
import { AlertCircle, Home, Shield } from "lucide-react";

function ErrorContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
              <Shield className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>

          {/* Error Message */}
          <Suspense fallback={<DefaultMessage />}>
            <ErrorMessage />
          </Suspense>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Homepage
            </Link>

            <Link
              href="/help"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              Contact Support
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              <strong>Need blog admin access?</strong>
              <br />
              Contact an administrator to be added to the whitelist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage() {
  // This needs to be a client component to access searchParams
  // Using a server component approach with dynamic import
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  const message = searchParams?.get("message");
  const discordId = searchParams?.get("discordId");

  if (!message) {
    return <DefaultMessage />;
  }

  return (
    <div className="space-y-3">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-sm text-red-800 dark:text-red-200 text-center">
          {message}
        </p>
      </div>

      {discordId && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Discord ID: <code className="font-mono">{discordId}</code>
          </p>
        </div>
      )}
    </div>
  );
}

function DefaultMessage() {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <p className="text-sm text-red-800 dark:text-red-200 text-center">
        You don't have permission to access this resource. Please contact an
        administrator if you believe this is an error.
      </p>
    </div>
  );
}

export default function AuthErrorPage() {
  return <ErrorContent />;
}
