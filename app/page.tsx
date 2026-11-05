'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, Zap, BookOpen, TrendingUp, Target, Award, ChevronRight, Star, Code2, Layers, Rocket, CheckCircle2 } from 'lucide-react'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { SiteHeader } from '@/components/SiteHeader'

interface User {
  name: string
  email: string
}

interface DecodedGoogleCredential {
  name?: string
  email?: string
}

export default function LandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showHeader, setShowHeader] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const decodeGoogleCredential = (credential: string): DecodedGoogleCredential | null => {
    try {
      const payload = credential.split('.')[1]
      if (!payload) return null

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
      const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
      const decoded = JSON.parse(atob(padded))

      return {
        name: decoded?.name,
        email: decoded?.email,
      }
    } catch {
      return null
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential

    if (!credential) {
      alert('Google sign-in did not return a credential. Please try again.')
      return
    }

    try {
      const apiUrl = `${window.location.origin}/api/auth/google`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
      const data = await response.json()

      if (response.ok && data.user) {
        const loggedInUser = { name: data.user.name, email: data.user.email }
        localStorage.setItem('user', JSON.stringify(loggedInUser))
        setUser(loggedInUser)
      } else {
        alert(`Failed to sign in with Google: ${data.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      // Fallback for local/dev network hiccups: decode Google credential on client.
      const decoded = decodeGoogleCredential(credential)
      if (decoded?.email && decoded?.name) {
        const loggedInUser = { name: decoded.name, email: decoded.email }
        localStorage.setItem('user', JSON.stringify(loggedInUser))
        setUser(loggedInUser)
        return
      }

      alert(`An error occurred during sign-in: ${error.message}`)
    }
  }

  const handleGoogleError = () => {
    alert('Google Sign-In was unsuccessful. Please try again.')
  }

  const handleSignInClick = () => {
    const googleBtn = document.querySelector('[aria-labelledby="button-label"]') as HTMLElement
    if (googleBtn) googleBtn.click()
  }

  const handleStartGenerating = () => router.push('/dashboard')
  const handleLogout = () => { localStorage.removeItem('user'); setUser(null) }

  useEffect(() => {
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.opacity = '0'
        setTimeout(() => { 
          loadingScreen.style.display = 'none'
          setShowHeader(true)
        }, 500)
      }, 1500)
    }
  }, [])

  const features = [
    { icon: Target, title: 'Smart Roadmaps', description: 'AI creates personalized learning paths tailored to your goals and experience level.', color: 'from-violet-500 to-purple-600' },
    { icon: Zap, title: 'Instant Explanations', description: 'Get detailed AI explanations with code examples and best practices.', color: 'from-amber-500 to-orange-600' },
    { icon: BookOpen, title: 'Interactive Learning', description: 'Track progress, mark completions, and visualize your journey.', color: 'from-emerald-500 to-teal-600' },
    { icon: TrendingUp, title: 'Progress Analytics', description: 'Monitor your growth with detailed stats and milestones.', color: 'from-blue-500 to-cyan-600' },
    { icon: Layers, title: 'PDF Export', description: 'Download roadmaps and explanations for offline study.', color: 'from-pink-500 to-rose-600' },
    { icon: Award, title: 'Structured Levels', description: 'Progress through Foundation, Intermediate, and Advanced stages.', color: 'from-indigo-500 to-violet-600' },
  ]

  return (
    <>
      {/* Loading Screen */}
      <div id="loading-screen" className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-50 flex items-center justify-center transition-opacity duration-500">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <Code2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">DevOdos</h2>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-600/5 to-purple-600/5 rounded-full blur-3xl"></div>
        </div>

        {showHeader && <SiteHeader
          userName={user?.name?.split(' ')[0]}
          onSignIn={user ? undefined : handleSignInClick}
          onLogout={user ? handleLogout : undefined}
        />}

        <div className="hidden"><GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} /></div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 lg:pt-44 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-full px-5 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-300">AI-Powered Learning Platform</span>
              </div>
              
              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Master Any Programming Skill</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Get a personalized roadmap tailored to your goals, experience level, and preferred programming language. Transform your coding journey with AI-powered learning paths designed for excellence.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12">
                <button onClick={user ? handleStartGenerating : handleSignInClick} className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-violet-500 hover:to-purple-500 transition-all shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105">
                  <Rocket className="w-5 h-5" />
                  <span>{user ? 'Generate your Roadmap' : 'Start Learning Free'}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-14 lg:mt-16">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="ml-4 text-sm text-slate-500 font-mono">roadmap.tsx</span>
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <div><span className="text-purple-400">const</span> <span className="text-blue-400">roadmap</span> <span className="text-white">=</span> <span className="text-amber-400">generateRoadmap</span><span className="text-slate-400">(</span><span className="text-white">&#123;</span></div>
                  <div className="pl-4"><span className="text-slate-400">goal:</span> <span className="text-emerald-400">&quot;Full Stack Developer&quot;</span><span className="text-white">,</span></div>
                  <div className="pl-4"><span className="text-slate-400">level:</span> <span className="text-emerald-400">&quot;beginner&quot;</span><span className="text-white">,</span></div>
                  <div className="pl-4"><span className="text-slate-400">language:</span> <span className="text-emerald-400">&quot;JavaScript&quot;</span></div>
                  <div><span className="text-white">&#125;</span><span className="text-slate-400">)</span><span className="text-white">;</span></div>
                  <div className="pt-2 text-slate-500">// ✨ AI generates your personalized path...</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Powerful Features</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Everything You Need to Succeed</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">Powerful tools and features designed to accelerate your learning journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="group relative bg-slate-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="relative py-20 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Simple Process</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">How It Works</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">Three simple steps to transform your coding journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                { num: '01', title: 'Set Your Goal', desc: 'Choose your career path, experience level, and preferred technologies.', color: 'from-violet-500 to-purple-600' },
                { num: '02', title: 'Get Your Roadmap', desc: 'AI generates a complete personalized learning path just for you.', color: 'from-blue-500 to-cyan-600' },
                { num: '03', title: 'Start Learning', desc: 'Follow the roadmap, track progress, and achieve your goals.', color: 'from-emerald-500 to-teal-600' },
              ].map((step, i) => (
                <div key={i} className="relative text-center">
                  {i < 2 && <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent"></div>}
                  <div className={`relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-8 shadow-2xl`}>
                    <span className="text-3xl font-bold text-white">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing/CTA Section */}
        <section id="pricing" className="relative py-20 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 text-center">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-amber-400">100% Free Forever</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
                <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">Join thousands of developers accelerating their careers with personalized AI-powered learning paths.</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <button onClick={user ? handleStartGenerating : handleSignInClick} className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-violet-500 hover:to-purple-500 transition-all shadow-2xl shadow-violet-500/25 hover:scale-105">
                    <Rocket className="w-5 h-5" />
                    <span>Get Started Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
                  {['No credit card required', 'Unlimited roadmaps', 'AI explanations included'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">DevOdos</span>
              </div>
              <div className="text-center md:text-right">
                <p className="text-slate-500 text-sm">© 2025 DevOdos. All rights reserved.</p>
                <p className="text-slate-600 text-xs mt-1">Developed under GENVO LABS</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
