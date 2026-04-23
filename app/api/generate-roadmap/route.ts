import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { validateRoadmapInput } from '@/lib/roadmapValidation'

const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

function parseJsonSafely(text: string): any {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(text)
  } catch {}

  // Strategy 2: Extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*(\[.*?\])\s*```/s)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch {}
  }

  // Strategy 3: Find array pattern
  const arrayMatch = text.match(/\[\s*\{.*?\}\s*\]/s)
  if (arrayMatch) {
    try {
      let jsonStr = arrayMatch[0]
      // Fix common JSON issues
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      return JSON.parse(jsonStr)
    } catch {}
  }

  return null
}

function createFallbackRoadmap(goal: string, level: string, language: string) {
  return [
    {
      level: "Foundation",
      nodes: [
        {
          title: `${language} Basics`,
          description: `Master the fundamentals of ${language} programming`,
          progress: 0,
          subTopics: [
            { title: "Syntax and Basic Concepts", desc: "Variables, data types, operators", completed: false },
            { title: "Control Structures", desc: "If statements, loops, conditionals", completed: false },
            { title: "Functions and Methods", desc: "Creating reusable code blocks", completed: false },
            { title: "Data Structures", desc: "Arrays, lists, objects", completed: false },
            { title: "Error Handling", desc: "Try-catch, debugging basics", completed: false }
          ]
        },
        {
          title: "Development Environment",
          description: "Set up your development tools and workflow",
          progress: 0,
          subTopics: [
            { title: "IDE Setup", desc: "Install and configure your code editor", completed: false },
            { title: "Version Control", desc: "Git basics and GitHub", completed: false },
            { title: "Command Line", desc: "Terminal/shell basics", completed: false },
            { title: "Package Managers", desc: "npm, pip, or similar tools", completed: false }
          ]
        }
      ]
    },
    {
      level: "Intermediate",
      nodes: [
        {
          title: `Advanced ${language}`,
          description: "Deep dive into advanced programming concepts",
          progress: 0,
          subTopics: [
            { title: "Object-Oriented Programming", desc: "Classes, inheritance, polymorphism", completed: false },
            { title: "Async Programming", desc: "Promises, async/await, callbacks", completed: false },
            { title: "Design Patterns", desc: "Common software design patterns", completed: false },
            { title: "Testing", desc: "Unit tests, integration tests", completed: false },
            { title: "Performance Optimization", desc: "Code efficiency and best practices", completed: false }
          ]
        },
        {
          title: `${goal} Fundamentals`,
          description: `Core concepts for ${goal}`,
          progress: 0,
          subTopics: [
            { title: "Architecture Patterns", desc: "System design fundamentals", completed: false },
            { title: "APIs and Integration", desc: "RESTful APIs, HTTP methods", completed: false },
            { title: "Databases", desc: "SQL and NoSQL basics", completed: false },
            { title: "Security Basics", desc: "Authentication, authorization", completed: false }
          ]
        }
      ]
    },
    {
      level: "Advanced",
      nodes: [
        {
          title: "Professional Development",
          description: "Skills needed for professional work",
          progress: 0,
          subTopics: [
            { title: "Code Review", desc: "Best practices for reviewing code", completed: false },
            { title: "CI/CD", desc: "Continuous integration and deployment", completed: false },
            { title: "Monitoring & Logging", desc: "Application observability", completed: false },
            { title: "Documentation", desc: "Writing clear technical docs", completed: false },
            { title: "Team Collaboration", desc: "Agile, scrum, code collaboration", completed: false }
          ]
        },
        {
          title: "Specialization",
          description: `Specialize in ${goal} technologies`,
          progress: 0,
          subTopics: [
            { title: "Framework Mastery", desc: "Deep knowledge of key frameworks", completed: false },
            { title: "Performance Tuning", desc: "Optimization at scale", completed: false },
            { title: "Cloud Deployment", desc: "AWS, Azure, or GCP", completed: false },
            { title: "Microservices", desc: "Distributed systems architecture", completed: false }
          ]
        }
      ]
    }
  ]
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { goal, level, language, description } = body

  if (!goal || !level || !language) {
    return NextResponse.json({ status: 'error', message: 'Missing required fields' }, { status: 400 })
  }

  const validation = validateRoadmapInput({ goal, level, language, description })
  if (!validation.isValid) {
    return NextResponse.json({ status: 'error', message: validation.message }, { status: 400 })
  }

  if (!groq) {
    // Return fallback roadmap if AI is not available
    const fallbackRoadmap = createFallbackRoadmap(goal, level, language)
    return NextResponse.json({
      status: 'success',
      roadmap: `Basic ${goal} Learning Roadmap for ${level} level using ${language}`,
      roadmap_json: fallbackRoadmap,
      message: '⚠️ Using fallback roadmap. Add Groq API key for AI-generated roadmaps.'
    })
  }

  try {
    console.log(`\n🎯 Generating roadmap: ${goal} | ${level} | ${language}`)

    const jsonPrompt = `Create a learning roadmap JSON for a ${level} developer who wants to become a ${goal} using ${language}.

Return ONLY valid JSON in this EXACT format (no markdown, no extra text):

[
  {
    "level": "Foundation",
    "nodes": [
      {
        "title": "Topic Name",
        "description": "Brief description",
        "progress": 0,
        "subTopics": [
          {"title": "Subtopic 1", "desc": "Description", "completed": false},
          {"title": "Subtopic 2", "desc": "Description", "completed": false}
        ]
      }
    ]
  }
]

Create 3-4 levels (Foundation, Intermediate, Advanced, Expert).
Each level should have 2-3 nodes.
Each node should have 5-7 subtopics.
Focus on ${goal} skills using ${language}.
Make it practical and career-focused.`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: jsonPrompt }],
      temperature: 0.1,
      max_tokens: 3000,
    })

    const rawOutput = response.choices[0]?.message?.content?.trim() || ''
    console.log(`📦 Received response (${rawOutput.length} chars)`)

    // Parse the JSON response
    let roadmapJson = parseJsonSafely(rawOutput)

    if (!roadmapJson || !Array.isArray(roadmapJson)) {
      console.log('⚠️  AI parsing failed, using fallback')
      roadmapJson = createFallbackRoadmap(goal, level, language)
    } else {
      console.log(`✅ Successfully parsed ${roadmapJson.length} levels`)
    }

    // Generate descriptive text
    const textPrompt = `Create a motivational and informative overview for becoming a ${goal} using ${language} at ${level} level.

Include:
1. Brief introduction (2-3 sentences)
2. Key skills you'll develop (3-4 bullet points)
3. Career opportunities (2-3 sentences)
4. Tips for success (2-3 bullet points)

Keep it concise and encouraging.`

    let roadmapText = `Your personalized ${goal} learning roadmap using ${language}. Follow the structured path to achieve your career goals!`
    
    try {
      const textResponse = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: textPrompt }],
        temperature: 0.5,
        max_tokens: 500,
      })
      roadmapText = textResponse.choices[0]?.message?.content?.trim() || roadmapText
    } catch {}

    console.log('✅ Roadmap generation completed!\n')

    return NextResponse.json({
      status: 'success',
      roadmap: roadmapText,
      roadmap_json: roadmapJson,
      message: `Generated ${roadmapJson.length} level roadmap`
    })
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`)
    const fallbackRoadmap = createFallbackRoadmap(goal, level, language)
    return NextResponse.json({
      status: 'success',
      roadmap: 'Fallback roadmap generated',
      roadmap_json: fallbackRoadmap,
      message: `Error occurred: ${error.message}. Using fallback roadmap.`
    })
  }
}
