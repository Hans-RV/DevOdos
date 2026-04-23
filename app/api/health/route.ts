import { NextResponse } from 'next/server'

export async function GET() {
  const groqStatus = process.env.GROQ_API_KEY ? '✅ Connected' : '⚠️ Not configured'

  return NextResponse.json({
    status: 'healthy',
    message: 'DevOdos Backend API',
    groq_ai: groqStatus,
    database: 'Not required (standalone mode)'
  })
}
