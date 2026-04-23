import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credential } = body

    if (!credential) {
      return NextResponse.json({ error: 'No credential provided' }, { status: 400 })
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID

    if (!googleClientId) {
      return NextResponse.json({ error: 'Google Client ID not configured' }, { status: 500 })
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    })

    const payload = ticket.getPayload()

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Extract user information
    const userData = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    }

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error: any) {
    console.error('Token verification failed:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
