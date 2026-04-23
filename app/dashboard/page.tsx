'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw, ArrowLeft, Sparkles, Code2, Loader2 } from 'lucide-react'
import { RoadmapForm } from '@/components/RoadmapForm'
import { RoadmapDisplay } from '@/components/RoadmapDisplay'
import { SiteHeader } from '@/components/SiteHeader'
import { generateRoadmap } from '@/lib/api'
import { RoadmapLevel, RoadmapFormData } from '@/types/roadmap'

interface UserData {
  name: string
  email: string
  isGuest?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapLevel[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RoadmapFormData | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(savedUser))

    // Load saved roadmap if exists
    const savedRoadmap = localStorage.getItem('roadmap')
    const savedFormData = localStorage.getItem('formData')
    if (savedRoadmap) {
      setRoadmap(JSON.parse(savedRoadmap))
    }
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('roadmap')
    localStorage.removeItem('formData')
    localStorage.removeItem('completedTopics')
    router.push('/')
  }

  const handleFormSubmit = async (data: RoadmapFormData) => {
    setLoading(true)
    setError(null)
    setFormData(data)
    localStorage.setItem('formData', JSON.stringify(data))
    
    try {
      const result = await generateRoadmap(data)
      setRoadmap(result)
      localStorage.setItem('roadmap', JSON.stringify(result))
    } catch (err: any) {
      console.error('Error generating roadmap:', err)
      setError(err.message || 'Failed to generate roadmap. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToForm = () => {
    setRoadmap(null)
    setError(null)
    localStorage.removeItem('roadmap')
    localStorage.removeItem('completedTopics')
  }

  const handleRetry = () => {
    if (formData) {
      handleFormSubmit(formData)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
          </div>
          <p className="text-slate-400 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Generation Failed</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={handleBackToForm}
              className="flex items-center justify-center gap-2 bg-slate-800 border border-white/10 text-slate-300 px-6 py-3 rounded-xl font-medium hover:bg-slate-700 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Form
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Roadmap display
  if (roadmap && formData) {
    return (
      <RoadmapDisplay
        roadmapData={roadmap}
        goal={formData.goal}
        level={formData.level}
        language={formData.language}
        userName={user.name.split(' ')[0]}
        onLogout={handleLogout}
        onBack={handleBackToForm}
      />
    )
  }

  // Form view
  return <RoadmapForm onSubmit={handleFormSubmit} loading={loading} userName={user.name.split(' ')[0]} onLogout={handleLogout} />
}
