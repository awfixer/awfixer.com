'use client'

import { signOut } from '@root/lib/auth/client'
import { Button } from '@components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SignOutButtonProps {
  className?: string
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  redirectTo?: string
  disabled?: boolean
}

export function SignOutButton({
  className,
  children = 'Sign Out',
  variant = 'ghost',
  size = 'default',
  redirectTo = '/',
  disabled = false,
  ...props
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Signing out...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-log-out"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {children}
        </div>
      )}
    </Button>
  )
}
