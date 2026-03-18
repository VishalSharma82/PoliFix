"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Menu, X, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#impact", label: "Impact" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong shadow-premium' : 'bg-transparent border-b border-transparent'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-glow-sm transition-all group-hover:shadow-glow group-hover:scale-105">
            <MapPin className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black text-foreground tracking-tight">PoliFix</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest -mt-0.5">AI Civic Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground px-4 py-2 rounded-xl hover:bg-primary/5 group"
            >
              {link.label}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all group-hover:w-4" />
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <Button asChild className="shadow-glow-sm hover:shadow-glow transition-all gap-2 rounded-xl">
              <Link href="/dashboard">
                <Zap className="w-4 h-4" />
                Open Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="rounded-xl font-semibold">
                <Link href="/auth?next=/dashboard">Log in</Link>
              </Button>
              <Button asChild className="shadow-glow-sm hover:shadow-glow transition-all rounded-xl font-bold">
                <Link href="/auth?next=/dashboard/profile/setup">Get Started Free →</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-card/60 backdrop-blur-md border border-border/60 text-foreground transition-all hover:bg-card active:scale-95"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          <AnimatePresence mode="wait" initial={false}>
            {mobileMenuOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Menu className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-border/40 glass-strong"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-primary/5 px-4 py-3 rounded-xl transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border/40">
                {user ? (
                  <Button asChild className="w-full rounded-xl gap-2">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Zap className="w-4 h-4" />Open Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full rounded-xl">
                      <Link href="/auth?next=/dashboard" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                    </Button>
                    <Button asChild className="w-full rounded-xl font-bold">
                      <Link href="/auth?next=/dashboard/profile/setup" onClick={() => setMobileMenuOpen(false)}>Get Started Free →</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
