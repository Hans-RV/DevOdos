'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Code2, Menu, X, LogOut } from 'lucide-react'

interface SiteHeaderProps {
  userName?: string
  onSignIn?: () => void
  onLogout?: () => void
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  userName,
  onSignIn,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
  ]

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.06] shadow-[0_10px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute -top-20 left-8 h-40 w-40 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 top-0 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />

          <div className="relative h-16 px-4 sm:px-5">
            <div className="flex h-full items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">DevOdos</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-4 py-2 text-sm rounded-lg transition-all text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2 sm:gap-3">
                {userName && onLogout && (
                  <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-medium text-white">{userName}</span>
                  </div>
                )}

                {onSignIn && !userName && (
                  <button
                    onClick={onSignIn}
                    className="rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition-all"
                  >
                    Sign in
                  </button>
                )}

                {onLogout && userName && (
                  <button
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-slate-100 hover:bg-white/20 transition-all"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}

                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Toggle navigation"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden border-t border-white/10 px-3 py-3">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm transition-all text-slate-200 hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}