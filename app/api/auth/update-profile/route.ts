import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@root/auth'

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { name, username } = body

    // Validate the input
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens' },
        { status: 400 }
      )
    }

    // Check if username is already taken (if it's different from current)
    if (username !== session.user.username) {
      try {
        // This would need to be implemented based on your database structure
        // For now, we'll assume the auth library handles unique constraints
        const existingUser = await auth.api.getUser({
          headers: request.headers,
          body: { username },
        })

        if (existingUser && existingUser.id !== session.user.id) {
          return NextResponse.json(
            { error: 'Username is already taken' },
            { status: 409 }
          )
        }
      } catch (error) {
        // If user not found, that's good - username is available
        console.log('Username check:', error)
      }
    }

    // Update the user profile
    const updatedUser = await auth.api.updateUser({
      headers: request.headers,
      body: {
        id: session.user.id,
        name: name.trim(),
        username: username.toLowerCase().trim(),
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })

  } catch (error) {
    console.error('Profile update error:', error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
