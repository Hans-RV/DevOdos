export interface SubTopic {
  title: string
  desc: string
  completed?: boolean
}

export interface RoadmapNode {
  title: string
  description: string
  progress?: number
  subTopics: SubTopic[]
}

export interface RoadmapLevel {
  level: string
  nodes: RoadmapNode[]
}

export interface RoadmapFormData {
  goal: string
  level: string
  language: string
  description?: string
  email?: string
}

export interface QuizData {
  question: string
  options: string[]
  answer: string
}

export interface UserStats {
  completedCount: string
  progressPercent: string
  currentLevel: string
  timeSpent: string
}
