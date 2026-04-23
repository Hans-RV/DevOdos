'use client'

import React, { useState, useEffect } from 'react'
import { downloadSubtopicPDF } from '@/lib/pdfGenerator'
import { X, Lightbulb, Code, BookOpen, CheckCircle, ExternalLink, Loader2, ChevronDown, ChevronUp, Sparkles, BookMarked, Layers, Target, Zap, Youtube, FileText, GraduationCap, Globe, Video, DollarSign, Gift, AlertTriangle, TrendingUp, Rocket, BookText, Copy, Check } from 'lucide-react'

interface TopicModalProps {
  topic: string
  description: string
  technology?: string
  onClose: () => void
  goal?: string
}

interface Resource {
  title: string
  url: string
  type: 'free' | 'paid'
  platform?: string
}

interface ParsedSection {
  title: string
  content: string
  icon: any
  color: string
}

export const TopicModal: React.FC<TopicModalProps> = ({
  topic,
  description,
  technology,
  onClose,
  goal
}) => {
  const [explanation, setExplanation] = useState<string>('')
  const [downloading, setDownloading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1]))
  const [resources, setResources] = useState<Resource[]>([])
  const [copiedCode, setCopiedCode] = useState<number | null>(null)

  useEffect(() => {
    fetchExplanation()
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [topic])

  // Download explanation as PDF
  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Use topic and description as subtopic
      await downloadSubtopicPDF({ title: topic, desc: description }, explanation, technology)
    } catch (err) {
      alert('Failed to download PDF. Please try again.')
    }
    setDownloading(false)
  }

  // Request a more detailed explanation from the backend
  const fetchExplanation = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          description,
          technology,
          goal,
          detailLevel: 'high' // ask backend for more detailed explanation
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch explanation')
      }

      const data = await response.json()
      setExplanation(data.explanation || 'No explanation available.')
      
      // Parse resources from explanation if available
      if (data.resources) {
        setResources(data.resources)
      } else {
        // Generate sample resources based on topic
        generateSampleResources()
      }
    } catch (err) {
      setError('Failed to load explanation. Please try again.')
      console.error('Error fetching explanation:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateSampleResources = () => {
    const sampleResources: Resource[] = [
      { title: `${topic} - MDN Web Docs`, url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`, type: 'free', platform: 'MDN' },
      { title: `Learn ${topic} - freeCodeCamp`, url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(topic)}`, type: 'free', platform: 'freeCodeCamp' },
      { title: `${topic} Tutorial - YouTube`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`, type: 'free', platform: 'YouTube' },
      { title: `${topic} Course - Udemy`, url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(topic)}`, type: 'paid', platform: 'Udemy' },
    ]
    setResources(sampleResources)
  }

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSections(newExpanded)
  }

  const copyCodeToClipboard = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(index)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const parseExplanation = (text: string): ParsedSection[] => {
    const sections: ParsedSection[] = []
    
    // Define section patterns and their properties with emoji support
    const sectionPatterns = [
      { pattern: /##\s*(?:📚|📖)?\s*(?:Overview|Introduction|What is)/gi, title: 'Overview', icon: BookText, color: 'violet' },
      { pattern: /##\s*(?:🎯)?\s*(?:Key Concepts?|Core Concepts?|Fundamentals?)/gi, title: 'Core Concepts', icon: Layers, color: 'blue' },
      { pattern: /##\s*(?:🔧|⚙️)?\s*(?:Technical Implementation|Implementation|How (?:it|to))/gi, title: 'Technical Implementation', icon: Code, color: 'emerald' },
      { pattern: /##\s*(?:💡)?\s*(?:Practical Use Cases?|Use Cases?|Examples?)/gi, title: 'Practical Use Cases', icon: Lightbulb, color: 'amber' },
      { pattern: /##\s*(?:✅)?\s*(?:Best Practices?|Tips|Standards)/gi, title: 'Best Practices', icon: Target, color: 'cyan' },
      { pattern: /##\s*(?:⚠️|❌)?\s*(?:Common Pitfalls?|Mistakes?|Avoid)/gi, title: 'Common Pitfalls', icon: AlertTriangle, color: 'rose' },
      { pattern: /##\s*(?:🚀)?\s*(?:Advanced Topics?|Advanced)/gi, title: 'Advanced Topics', icon: Rocket, color: 'purple' },
      { pattern: /##\s*(?:💼)?\s*(?:Career|Industry Impact)/gi, title: 'Career & Industry', icon: TrendingUp, color: 'indigo' },
      { pattern: /##\s*(?:📖)?\s*(?:Learning Path|Next Steps?)/gi, title: 'Learning Path', icon: BookMarked, color: 'teal' },
    ]

    // If explanation is short or doesn't have clear sections, return as single overview
    if (text.length < 200 || !text.includes('##')) {
      return [{
        title: 'Overview',
        content: text,
        icon: BookText,
        color: 'violet'
      }]
    }

    // Split by markdown headers (##)
    const headerRegex = /##\s*(?:[📚📖🎯🔧⚙️💡✅⚠️❌🚀💼📖])?\s*([^\n]+)/g
    const parts: Array<{header: string, content: string}> = []
    
    let match
    const matches: Array<{header: string, index: number}> = []
    
    while ((match = headerRegex.exec(text)) !== null) {
      matches.push({ header: match[1].trim(), index: match.index })
    }
    
    // Extract content for each section
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i]
      const next = matches[i + 1]
      const endIndex = next ? next.index : text.length
      
      const content = text.substring(current.index, endIndex)
        .replace(/##\s*(?:[📚📖🎯🔧⚙️💡✅⚠️❌🚀💼📖])?\s*[^\n]+\n/, '')
        .trim()
      
      parts.push({ header: current.header, content })
    }
    
    // Map to ParsedSection format
    for (const part of parts) {
      const matchingPattern = sectionPatterns.find(p => 
        p.pattern.test('## ' + part.header)
      ) || sectionPatterns[0]
      
      sections.push({
        title: part.header.replace(/^[📚📖🎯🔧⚙️💡✅⚠️❌🚀💼📖]\s*/, ''),
        content: part.content,
        icon: matchingPattern.icon,
        color: matchingPattern.color
      })
    }
    
    // If no sections were parsed, return entire text as overview
    if (sections.length === 0) {
      return [{
        title: 'Overview',
        content: text,
        icon: BookText,
        color: 'violet'
      }]
    }
    
    return sections
  }

  const formatContent = (content: string) => {
    const parts: Array<{type: 'text' | 'code', content: string, language?: string}> = []
    
    // Extract code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    let lastIndex = 0
    let match
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.substring(lastIndex, match.index) })
      }
      
      // Add code block
      parts.push({ 
        type: 'code', 
        content: match[2].trim(),
        language: match[1] || 'javascript'
      })
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(lastIndex) })
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content }]
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
      violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', gradient: 'from-violet-500 to-purple-600' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500 to-cyan-600' },
      emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-600' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', gradient: 'from-amber-500 to-orange-600' },
      rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', gradient: 'from-rose-500 to-pink-600' },
      indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', gradient: 'from-indigo-500 to-blue-600' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500 to-blue-600' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 to-pink-600' },
      teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', gradient: 'from-teal-500 to-emerald-600' },
    }
    return colors[color] || colors.violet
  }

  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'youtube': return Video
      case 'udemy': return GraduationCap
      case 'freecodecamp': return Code
      case 'mdn': return Globe
      default: return BookOpen
    }
  }

  const parsedSections = parseExplanation(explanation)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-2">
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span className="text-xs font-medium text-violet-300">{technology || 'Topic'}</span>
              </div>
              <h2 className="text-xl font-bold text-white truncate">{topic}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 overflow-y-auto max-h-[calc(90vh-88px)] p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
              </div>
              <p className="text-slate-400 text-lg mb-2">Generating explanation...</p>
              <p className="text-slate-500 text-sm">AI is creating a detailed explanation for you</p>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <X className="w-6 h-6 text-rose-400" />
              </div>
              <p className="text-rose-300 font-semibold mb-2">Failed to load explanation</p>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <button
                onClick={fetchExplanation}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Description */}
              {description && (
                <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 mb-6">
                  <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
                </div>
              )}

              {/* Parsed Sections */}
              {parsedSections.map((section, index) => {
                const colors = getColorClasses(section.color)
                const isExpanded = expandedSections.has(index)
                const IconComponent = section.icon

                return (
                  <div 
                    key={index}
                    className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden transition-all`}
                  >
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-white">{section.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className={`w-5 h-5 ${colors.text}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${colors.text}`} />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="pl-11 space-y-3">
                          {formatContent(section.content).map((part, partIndex) => (
                            part.type === 'code' ? (
                              <div key={partIndex} className="relative group">
                                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <span className="text-xs text-slate-500 font-mono bg-slate-900/80 px-2 py-1 rounded">{part.language || 'code'}</span>
                                  <button
                                    onClick={() => copyCodeToClipboard(part.content, partIndex)}
                                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
                                    title="Copy code"
                                  >
                                    {copiedCode === partIndex ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-slate-400" />
                                    )}
                                  </button>
                                </div>
                                <pre className="bg-slate-950/50 border border-white/5 rounded-lg p-4 overflow-x-auto">
                                  <code className="text-sm font-mono text-slate-300">{part.content}</code>
                                </pre>
                              </div>
                            ) : (
                              <div 
                                key={partIndex} 
                                className="text-slate-300 text-sm leading-relaxed space-y-2 prose-sm prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ 
                                  __html: part.content
                                    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-800 rounded text-xs font-mono text-emerald-400">$1</code>')
                                    .replace(/^- (.+)$/gm, '<div class="flex gap-2 ml-2"><span class="' + colors.text + ' mt-1 flex-shrink-0">•</span><span>$1</span></div>')
                                    .replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 ml-2"><span class="' + colors.text + ' font-medium flex-shrink-0">$1.</span><span>$2</span></div>')
                                    .split('\n\n')
                                    .map(para => para.trim() ? `<p class="mb-2">${para}</p>` : '')
                                    .join('')
                                }}
                              />
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Resources Section */}
              {resources.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                      <BookMarked className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-white">Learning Resources</h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {resources.map((resource, index) => {
                      const PlatformIcon = getPlatformIcon(resource.platform)
                      
                      return (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${
                            resource.type === 'free'
                              ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            resource.type === 'free' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                          }`}>
                            <PlatformIcon className={`w-5 h-5 ${resource.type === 'free' ? 'text-emerald-400' : 'text-amber-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white text-sm truncate">{resource.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {resource.type === 'free' ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                  <Gift className="w-3 h-3" /> Free
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-amber-400">
                                  <DollarSign className="w-3 h-3" /> Paid
                                </span>
                              )}
                              {resource.platform && (
                                <span className="text-xs text-slate-500">• {resource.platform}</span>
                              )}
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={fetchExplanation}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-white/10 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Regenerate
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading || !explanation}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 ${downloading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <FileText className="w-4 h-4" />
                  {downloading ? 'Downloading...' : 'Download Explanation'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
                >
                  <CheckCircle className="w-4 h-4" />
                  Got it!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
