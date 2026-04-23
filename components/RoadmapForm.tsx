'use client'

import React, { useState } from 'react'
import { Target, Code, FileText, AlertCircle, Sparkles, Rocket } from 'lucide-react'
import type { RoadmapFormData } from '@/types/roadmap'
import { validateRoadmapInput } from '@/lib/roadmapValidation'
import { SiteHeader } from './SiteHeader'

interface RoadmapFormProps {
  onSubmit: (data: RoadmapFormData) => void
  loading: boolean
  userName?: string
  onLogout?: () => void
}

export const RoadmapForm: React.FC<RoadmapFormProps> = ({ onSubmit, loading, userName, onLogout }) => {
  const [formData, setFormData] = useState<RoadmapFormData>({
    goal: '',
    level: '',
    language: '',
    description: ''
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateRoadmapInput(formData)
    if (!validation.isValid) {
      setValidationError(validation.message || 'Please enter valid coding-related details.')
      return
    }

    setValidationError(null)
    onSubmit(formData)
  }

  const levels = [
    { value: 'beginner', label: 'Beginner', desc: 'New to programming', color: 'from-emerald-500 to-teal-600' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Some experience', color: 'from-blue-500 to-cyan-600' },
    { value: 'advanced', label: 'Advanced', desc: 'Experienced dev', color: 'from-violet-500 to-purple-600' }
  ]

  return (
    <div className="min-h-screen bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SiteHeader userName={userName} onLogout={onLogout} />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-20">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-full px-5 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Create Your Personalized Roadmap</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Your Learning Roadmap</h1>
            <p className="text-slate-400">Tell us about your goals and we&apos;ll create a personalized path</p>
          </div>

          {loading && (
            <div className="mb-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 text-violet-200">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 border-2 border-violet-400/30 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-violet-400 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div>
                  <div className="font-semibold text-white">Generating Your Roadmap...</div>
                  <div className="text-sm text-slate-400">This may take 30-60 seconds. Please wait...</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {validationError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3 text-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5" />
                  <p className="text-sm">{validationError}</p>
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Target className="w-4 h-4 text-violet-400" />
                </div>
                What&apos;s your career goal?
              </label>
              <input
                type="text"
                value={formData.goal}
                onChange={(e) => {
                  setFormData({ ...formData, goal: e.target.value })
                  if (validationError) setValidationError(null)
                }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder-slate-500"
                placeholder="e.g., Full Stack Developer, ML Engineer..."
                required
                disabled={loading}
              />
              <p className="text-slate-500 text-sm mt-2">Enter any development career goal you&apos;re interested in</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                What&apos;s your experience level?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {levels.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, level: level.value })
                      if (validationError) setValidationError(null)
                    }}
                    disabled={loading}
                    className={`relative p-4 rounded-xl border transition-all duration-300 disabled:opacity-50 overflow-hidden group ${
                      formData.level === level.value
                        ? 'border-violet-500/50 bg-gradient-to-br from-violet-500/20 to-purple-500/20 shadow-lg shadow-violet-500/20'
                        : 'border-white/10 bg-slate-800/30 hover:border-violet-500/30 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative z-10">
                      <div className={`font-semibold text-sm sm:text-base ${formData.level === level.value ? 'text-white' : 'text-slate-300'}`}>{level.label}</div>
                      <div className="text-xs text-slate-500 hidden sm:block mt-1">{level.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Code className="w-4 h-4 text-emerald-400" />
                </div>
                Preferred programming language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => {
                  setFormData({ ...formData, language: e.target.value })
                  if (validationError) setValidationError(null)
                }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder-slate-500"
                placeholder="e.g., JavaScript, Python, Java..."
                required
                disabled={loading}
              />
              <p className="text-slate-500 text-sm mt-2">Enter any programming language you want to learn</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-amber-400" />
                </div>
                Additional details (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  if (validationError) setValidationError(null)
                }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none placeholder-slate-500"
                rows={2}
                placeholder="Describe coding goals, frameworks, projects, or technical interests..."
                disabled={loading}
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="font-semibold text-amber-300 text-sm">Please Note:</div>
                  <div className="text-slate-400 text-sm">Roadmap generation may take 30-60 seconds. Please be patient.</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.goal || !formData.level || !formData.language}
              className="group w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Generate My Roadmap
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
