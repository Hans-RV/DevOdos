import type { RoadmapLevel, RoadmapFormData } from '@/types/roadmap'

export const generateRoadmap = async (formData: RoadmapFormData): Promise<RoadmapLevel[]> => {
  console.log('🚀 Starting roadmap generation with data:', formData)

  try {
    const response = await fetch('/api/generate-roadmap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    console.log('📡 Response status:', response.status)

    if (!response.ok) {
      let message = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        message = errorData?.message || message
      } catch {}
      throw new Error(message)
    }

    const data = await response.json()
    console.log('📦 Response data:', data)

    if (data.status === 'error') {
      throw new Error(data.message || 'Failed to generate roadmap')
    }

    if (data.roadmap_json) {
      console.log('✅ Found roadmap_json in response')
      return data.roadmap_json
    }

    throw new Error('No roadmap data received')
  } catch (error) {
    console.error('❌ Error in generateRoadmap:', error)
    throw error
  }
}

export const explainTopic = async (topic: string, technology?: string): Promise<string> => {
  try {
    const params = new URLSearchParams({ topic })
    if (technology) {
      params.append('technology', technology)
    }

    console.log('Fetching explanation for:', topic, 'with technology:', technology)

    const response = await fetch(`/api/explain-topic?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.log('API response:', data)

    if (data.status === 'error') {
      throw new Error(data.message)
    }

    return data.explanation
  } catch (error) {
    console.error('Error in explainTopic:', error)
    throw error
  }
}
