'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@root/lib/auth/client'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Alert, AlertDescription } from '@components/ui/alert'

export default function CompleteProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [formData, setFormData] = useState({
    name: '',
    username: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
      })

      // If user already has required info, redirect
      if (user.name && user.username) {
        router.push(callbackUrl)
      }
    }
  }, [user, isLoading, router, callbackUrl])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Display name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Display name must be at least 2 characters'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Display name must be less than 50 characters'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(formData.username)) {
      newErrors.username = 'Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      router.push(callbackUrl)
    } catch (error) {
      console.error('Profile update failed:', error)
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update profile',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/api/auth/sign-in/discord')
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Please complete your profile information to access AWFixer content.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your display name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter a unique username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                className={errors.username ? 'border-red-500 focus:border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.username}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                3-30 characters, letters, numbers, underscores, or hyphens only
              </p>
            </div>

            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating Profile...
                </div>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your Discord account: {user.email}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
