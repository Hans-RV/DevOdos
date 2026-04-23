'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, ChevronDown, ChevronUp, CheckCircle2, BookOpen, Target, RotateCcw, Download, Clock, Zap, BarChart3, Sparkles } from 'lucide-react'
import type { RoadmapLevel, SubTopic } from '@/types/roadmap'
import { TopicModal } from './TopicModal'
import { downloadFullRoadmapPDF } from '@/lib/pdfGenerator'
import { SiteHeader } from './SiteHeader'

interface RoadmapDisplayProps {
  roadmapData: RoadmapLevel[]
  onBack: () => void
  goal?: string
  level?: string
  language?: string
  userName?: string
  onLogout?: () => void
}

export const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({
  roadmapData,
  onBack,
  goal = 'Programming',
  level = 'Intermediate',
  language = 'JavaScript',
  userName,
  onLogout,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['0']))
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set())
  const [selectedTopic, setSelectedTopic] = useState<{ title: string; desc: string; technology?: string } | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const totalTopics = roadmapData.reduce((total, level) => {
    return total + level.nodes.reduce((nodeTotal, node) => nodeTotal + node.subTopics.length, 0)
  }, 0)

  const progressPercentage = totalTopics > 0 ? Math.round((completedTopics.size / totalTopics) * 100) : 0

  const primaryTechnology = roadmapData.length > 0
    ? roadmapData[0].nodes.find(node =>
        node.title.toLowerCase().includes('javascript') ||
        node.title.toLowerCase().includes('python') ||
        node.title.toLowerCase().includes('react') ||
        node.title.toLowerCase().includes('java')
      )?.title || language
    : language

  const toggleNode = (levelIndex: number, nodeIndex: number) => {
    const key = `${levelIndex}-${nodeIndex}`
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedNodes(newExpanded)
  }

  const toggleTopic = (topicKey: string) => {
    const newCompleted = new Set(completedTopics)
    if (newCompleted.has(topicKey)) {
      newCompleted.delete(topicKey)
    } else {
      newCompleted.add(topicKey)
    }
    setCompletedTopics(newCompleted)
  }

  const handleTopicClick = (topic: SubTopic, technology: string) => {
    setSelectedTopic({
      title: topic.title,
      desc: topic.desc,
      technology
    })
  }

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true)
    try {
      await downloadFullRoadmapPDF(roadmapData, goal, level, language)
    } finally {
      setDownloadingPDF(false)
    }
  }

  const getLevelColor = (index: number) => {
    const colors = [
      { gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
      { gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
      { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
      { gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
      { gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
      { gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <SiteHeader userName={userName} onLogout={onLogout} />

      <div className="relative z-10 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-violet-300">Your Learning Path</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{goal} Roadmap</h1>
                  <p className="text-slate-400 text-sm sm:text-base">Your personalized path to becoming a {goal}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={downloadingPDF}
                      aria-label="Export roadmap as PDF"
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 text-slate-100 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingPDF ? 'Generating...' : 'Export PDF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onBack}
                      aria-label="Generate a new roadmap"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>New Roadmap</span>
                    </button>
                  </div>
                </div>

                {/* Progress Card */}
                <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 min-w-[280px]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-sm font-medium">Overall Progress</span>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 font-bold">{progressPercentage}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{completedTopics.size} of {totalTopics} topics</span>
                    <span className="text-slate-400">{roadmapData.length} levels</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                    <Target className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Goal</div>
                    <div className="font-semibold text-white text-sm truncate max-w-[100px]">{goal}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Level</div>
                    <div className="font-semibold text-white text-sm capitalize">{level}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Topics</div>
                    <div className="font-semibold text-white text-sm">{totalTopics} total</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Est. Time</div>
                    <div className="font-semibold text-white text-sm">{roadmapData.length * 2}-{roadmapData.length * 4} weeks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Roadmap Levels */}
          <div className="space-y-4">
            {roadmapData.map((lvl, levelIndex) => {
              const levelColors = getLevelColor(levelIndex)
              const levelTopics = lvl.nodes.reduce((acc, node) => acc + node.subTopics.length, 0)
              const levelCompleted = lvl.nodes.reduce((acc, node) => {
                return acc + node.subTopics.filter(topic => 
                  completedTopics.has(`${levelIndex}-${node.title}-${topic.title}`)
                ).length
              }, 0)
              const levelProgress = levelTopics > 0 ? Math.round((levelCompleted / levelTopics) * 100) : 0

              return (
                <div 
                  key={levelIndex}
                  className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                >
                  {/* Level Header */}
                  <div className="p-5 sm:p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${levelColors.gradient} flex items-center justify-center shadow-lg`}>
                          <span className="text-white font-bold text-lg">{levelIndex + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">{lvl.level}</h3>
                          <p className="text-slate-400 text-sm">{levelTopics} topics • {levelProgress}% complete</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${levelColors.gradient} rounded-full transition-all duration-500`}
                              style={{ width: `${levelProgress}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${levelColors.text}`}>{levelProgress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Level Nodes */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {lvl.nodes.map((node, nodeIndex) => {
                      const nodeKey = `${levelIndex}-${nodeIndex}`
                      const isExpanded = expandedNodes.has(nodeKey)
                      const nodeCompleted = node.subTopics.filter(topic => 
                        completedTopics.has(`${levelIndex}-${node.title}-${topic.title}`)
                      ).length
                      const nodeProgress = node.subTopics.length > 0 
                        ? Math.round((nodeCompleted / node.subTopics.length) * 100) 
                        : 0

                      return (
                        <div key={nodeIndex} className="bg-slate-800/30 rounded-xl border border-white/5 overflow-hidden">
                          {/* Node Header */}
                          <button
                            type="button"
                            onClick={() => toggleNode(levelIndex, nodeIndex)}
                            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.title}`}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${levelColors.bg} border ${levelColors.border} flex items-center justify-center`}>
                                <BookOpen className={`w-4 h-4 ${levelColors.text}`} />
                              </div>
                              <div className="text-left">
                                <h4 className="font-semibold text-white text-sm sm:text-base">{node.title}</h4>
                                <p className="text-slate-500 text-xs">{node.subTopics.length} topics • {nodeProgress}% done</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                  className={`h-full bg-gradient-to-r ${levelColors.gradient} rounded-full transition-all`}
                                  style={{ width: `${nodeProgress}%` }}
                                />
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {/* Node Topics */}
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2">
                              {node.subTopics.map((topic, topicIndex) => {
                                const topicKey = `${levelIndex}-${node.title}-${topic.title}`
                                const isCompleted = completedTopics.has(topicKey)

                                return (
                                  <div 
                                    key={topicIndex}
                                    className={`group relative rounded-lg border transition-all duration-300 ${
                                      isCompleted 
                                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                                        : 'bg-slate-800/50 border-white/5 hover:border-violet-500/30 hover:bg-slate-800/70'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 p-3">
                                      {/* Checkbox */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleTopic(topicKey)
                                        }}
                                        aria-label={`${isCompleted ? 'Mark as not completed' : 'Mark as completed'}: ${topic.title}`}
                                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                          isCompleted 
                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                            : 'border-slate-600 hover:border-violet-500'
                                        }`}
                                      >
                                        {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                                      </button>

                                      {/* Topic Content */}
                                      <div className="flex-1 text-left min-w-0">
                                        <h5 className={`font-medium text-sm transition-colors ${
                                          isCompleted ? 'text-emerald-300' : 'text-white group-hover:text-violet-300'
                                        }`}>
                                          {topic.title}
                                        </h5>
                                        {topic.desc && (
                                          <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{topic.desc}</p>
                                        )}
                                      </div>

                                      {/* Learn Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleTopicClick(topic, node.title)}
                                        aria-label={`Open topic details for ${topic.title}`}
                                        className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                          isCompleted
                                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                            : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                                        }`}
                                      >
                                        {isCompleted ? 'Review' : 'Learn'}
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Completion Message */}
          {progressPercentage === 100 && (
            <div className="mt-8 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">🎉 Congratulations!</h3>
              <p className="text-slate-400 mb-4">You&apos;ve completed all topics in this roadmap. Amazing achievement!</p>
              <button
                type="button"
                onClick={onBack}
                aria-label="Create another roadmap"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
              >
                <Zap className="w-5 h-5" />
                Create Another Roadmap
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Topic Modal */}
      {selectedTopic && (
        <TopicModal
          topic={selectedTopic.title}
          description={selectedTopic.desc}
          technology={selectedTopic.technology}
          onClose={() => setSelectedTopic(null)}
          goal={goal}
        />
      )}
    </div>
  )
}
