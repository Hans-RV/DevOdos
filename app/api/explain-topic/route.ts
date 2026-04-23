import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

async function generateExplanation(topic: string, technology: string, description?: string, goal?: string) {
  if (!topic) {
    return NextResponse.json({ status: 'error', message: 'Missing topic' }, { status: 400 })
  }

  if (!groq) {
    return NextResponse.json({
      status: 'error',
      message: '⚠️ Groq API key not configured. Please add your API key to the environment variables.'
    }, { status: 500 })
  }

  const context = technology ? ` in the context of ${technology}` : ''
  const goalContext = goal ? ` for someone learning ${goal}` : ''

  const prompt = `Provide a comprehensive, detailed explanation of '${topic}'${context}${goalContext} for software developers.
${description ? `\nContext: ${description}` : ''}

Structure your response EXACTLY with these section headers (use ## for headers):

## 📚 Overview
Write 2-3 well-detailed paragraphs explaining:
- What this concept/technology is
- Why it's important in modern software development
- Where and when it's commonly used
- How it fits into the bigger picture

## 🎯 Core Concepts
Explain the fundamental principles in detail. For each concept, provide:
- **Concept Name**: Detailed explanation (2-3 sentences)
- **Concept Name**: Detailed explanation (2-3 sentences)
- **Concept Name**: Detailed explanation (2-3 sentences)
(Include 4-6 core concepts)

## 🔧 Technical Implementation
Provide comprehensive technical details:
- How it works under the hood
- Key APIs, methods, or syntax
- Configuration requirements
- Integration patterns
- Performance considerations
If applicable, include a simple code example using triple backticks (\`\`\`language).

## 💡 Practical Use Cases
Describe real-world applications with specifics:
- **Use Case 1**: Detailed scenario explaining problem, solution, and outcome
- **Use Case 2**: Detailed scenario explaining problem, solution, and outcome
- **Use Case 3**: Detailed scenario explaining problem, solution, and outcome
(Include 4-5 practical examples)

## ✅ Best Practices
Provide actionable industry standards:
- **Practice 1**: Detailed explanation of why and how (2-3 sentences)
- **Practice 2**: Detailed explanation of why and how (2-3 sentences)
- **Practice 3**: Detailed explanation of why and how (2-3 sentences)
(Include 5-7 best practices)

## ⚠️ Common Pitfalls
Write 2-3 detailed paragraphs covering:
- Frequent mistakes developers make
- Misconceptions to avoid
- Edge cases to watch out for
- How to prevent and fix these issues

## 🚀 Advanced Topics
Briefly introduce advanced concepts to explore next:
- **Advanced Topic 1**: Why it matters
- **Advanced Topic 2**: Why it matters
- **Advanced Topic 3**: Why it matters

## 💼 Career & Industry Impact
Write 2 paragraphs explaining:
- Why this matters professionally
- Which companies/industries use it
- Job market relevance
- Salary implications or career growth

## 📖 Learning Path
Suggest a clear progression:
1. **Foundation**: What to master first
2. **Intermediate**: Next level skills
3. **Advanced**: Expert-level topics
4. **Related Technologies**: Complementary skills to learn

Make every section informative, specific, and actionable. Use technical terms accurately. Include code examples where helpful using \`\`\`language syntax.`

  try {
    console.log(`🔍 Explaining: ${topic}${context}`)

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 4000,
    })

    const explanation = response.choices[0]?.message?.content?.trim() || ''
    console.log(`✅ Generated explanation (${explanation.length} chars)`)

    return NextResponse.json({ status: 'success', explanation })
  } catch (error: any) {
    console.error(`❌ Explanation error: ${error.message}`)

    const errorMsg = error.message?.toLowerCase() || ''
    if (errorMsg.includes('api') || errorMsg.includes('key') || errorMsg.includes('auth')) {
      return NextResponse.json({
        status: 'error',
        message: '⚠️ API authentication failed. Please check your Groq API key.'
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'error',
      message: `Failed to generate explanation: ${error.message}`
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get('topic') || ''
  const technology = searchParams.get('technology') || ''

  return generateExplanation(topic, technology)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, technology, description, goal } = body

    return generateExplanation(topic || '', technology || '', description, goal)
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Invalid request body' }, { status: 400 })
  }
}
