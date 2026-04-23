import type { RoadmapFormData } from '@/types/roadmap'

const codingGoalKeywords = [
  'developer', 'engineer', 'programmer', 'software', 'frontend', 'backend', 'full stack',
  'fullstack', 'web dev', 'mobile dev', 'app dev', 'devops', 'data engineer', 'ml engineer',
  'ai engineer', 'qa engineer', 'sre', 'cloud engineer', 'game developer', 'blockchain developer'
]

const codingDescriptionKeywords = [
  'code', 'coding', 'programming', 'development', 'developer', 'software', 'api', 'framework',
  'library', 'frontend', 'backend', 'full stack', 'database', 'algorithm', 'data structure',
  'debug', 'testing', 'deployment', 'project', 'application', 'web', 'mobile', 'devops',
  'typescript', 'javascript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'node', 'react'
]

const programmingLanguages = [
  'javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'go', 'golang', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'dart', 'scala', 'r', 'matlab', 'perl', 'lua', 'haskell',
  'elixir', 'clojure', 'f#', 'objective-c', 'shell', 'bash', 'powershell', 'sql', 'html',
  'css', 'sass', 'less', 'node.js', 'nodejs'
]

function containsAnyKeyword(value: string, keywords: string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword))
}

function isProgrammingLanguage(input: string): boolean {
  const normalized = input.trim().toLowerCase()
  if (!normalized) {
    return false
  }

  return programmingLanguages.some((lang) => {
    return normalized === lang || normalized.includes(lang) || lang.includes(normalized)
  })
}

export function validateRoadmapInput(formData: RoadmapFormData): { isValid: boolean; message?: string } {
  const goal = formData.goal?.trim().toLowerCase() || ''
  const language = formData.language?.trim() || ''
  const description = formData.description?.trim().toLowerCase() || ''

  if (!goal || !formData.level || !language) {
    return {
      isValid: false,
      message: 'Please fill all required fields with coding-related information.'
    }
  }

  if (!containsAnyKeyword(goal, codingGoalKeywords)) {
    return {
      isValid: false,
      message: 'Career goal must be software/developer related (for example: Frontend Developer, Backend Engineer, Data Engineer).'
    }
  }

  if (!isProgrammingLanguage(language)) {
    return {
      isValid: false,
      message: 'Preferred language must be a valid programming language (for example: JavaScript, Python, Java, C++, TypeScript).'
    }
  }

  if (description && !containsAnyKeyword(description, codingDescriptionKeywords)) {
    return {
      isValid: false,
      message: 'Additional details must be related to coding, software development, tools, frameworks, or technical goals.'
    }
  }

  return { isValid: true }
}
