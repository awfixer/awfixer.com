'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from '@root/lib/auth/client'
import type { User, Session } from '@root/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false)
    }
  }, [isPending])

  const value: AuthContextType = {
    user: session?.user || null,
    session: session || null,
    isLoading: isLoading || isPending,
    isAuthenticated: !!session?.user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
