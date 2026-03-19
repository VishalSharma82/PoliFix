"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { ArrowRight, MapPin, CheckCircle2, Users, Zap, TrendingUp as TrendingUpIcon } from "lucide-react"

export function LandingHero() {
  const [particles, setParticles] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [wordIndex, setWordIndex] = useState(0)

  const accentWords = ["Fix Cities.", "Build Trust.", "Drive Change."]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    setParticles([...Array(8)].map((_, i) => ({
      id: i,
      x: Math.random() * 60 - 30,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    })))

    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % 3)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background decorations - More dynamic */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px] animate-float" />

      {/* Floating particles simulation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute h-2 w-2 rounded-full bg-primary/20"
            animate={{
              y: [0, -100, 0],
              x: [0, p.x, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
            style={{
              left: p.left,
              top: p.top,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-8"
          >
            <Badge variant="outline" className="w-fit gap-2 px-4 py-2 border-primary/30 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-primary backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Empowering 12,500+ Local Action Takers
            </Badge>

            <div className="flex flex-col gap-4">
              <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:text-8xl leading-[1.02]">
                Map Problems.{" "}
                <span className="block relative h-[1.15em] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -40, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="gradient-text-blue animate-gradient block"
                    >
                      {["Fix Cities.", "Build Trust.", "Drive Change."][wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Connect with your community to report infrastructure gaps, verify local issues, and drive real-world solutions through AI-powered civic action.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="h-14 px-8 text-base font-bold gap-2 group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.55)] transition-all active:scale-95 rounded-2xl border-0">
                <Link href={user ? "/dashboard/report" : "/auth?next=/dashboard/report"}>
                  <MapPin className="h-5 w-5" />
                  Report a Problem
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base font-bold backdrop-blur-sm border-blue-500/30 hover:bg-blue-500/5 hover:border-blue-500/50 transition-all rounded-2xl">
                <Link href={user ? "/dashboard" : "/auth?next=/dashboard"}>Explore Map Live ↗</Link>
              </Button>
            </div>

            {/* Live Stats Row */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { label: "Reports Filed", value: "14.2K+", color: "text-blue-600" },
                { label: "Issues Resolved", value: "11.8K+", color: "text-green-600" },
                { label: "Active Verifiers", value: "3.4K+", color: "text-amber-600" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Live activity */}
            <div className="flex flex-col gap-3 pt-5 border-t border-border/40">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Activity</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="inline-block h-9 w-9 rounded-full ring-2 ring-background bg-muted overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User avatar" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-background bg-primary text-[9px] font-black text-white">
                    +1.2k
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">Rahul</span>{" "}
                  confirmed a{" "}
                  <span className="text-primary font-semibold">water leak</span>{" "}
                  in Sector 4
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right content - Map Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm p-3 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
              {/* Decorative rings */}
              <div className="absolute -inset-4 rounded-[40px] border border-primary/10 -z-10 animate-pulse" />

              {/* Map mockup */}
              <div className="relative aspect-[4/3] rounded-2xl bg-muted/30 overflow-hidden border border-border/40">
                {/* Visual Map Texture */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center grayscale opacity-10" />
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px]" />

                {/* Map Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.9_0.01_250/0.3)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.9_0.01_250/0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />

                {/* Map markers - Interactive looking */}
                <motion.div
                  className="absolute top-1/4 left-1/3"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 rounded-full bg-critical/40 animate-pulse-ring" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-critical text-critical-foreground shadow-2xl transition-transform group-hover:scale-110">
                      <MapPin className="h-6 w-6" />
                    </div>
                    {/* Popover hint */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Critical Pothole
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-1/2 right-1/4"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="relative group cursor-pointer">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-moderate text-moderate-foreground shadow-xl transition-transform group-hover:scale-110">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-1/4 left-1/2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                  <div className="relative group cursor-pointer">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground shadow-xl transition-transform group-hover:scale-110">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>

                {/* Status Dashboard floating element */}
                <div className="absolute top-6 left-6 p-4 rounded-xl glass border border-white/20 shadow-lg max-w-[180px] animate-fade-in">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-tighter">Resolution Rate</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-primary">84%</span>
                    <TrendingUp className="h-4 w-4 text-success mb-1" />
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      transition={{ duration: 1.5, delay: 1 }}
                    />
                  </div>
                </div>

                {/* Floating Notification Panel */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute bottom-6 right-6 p-4 rounded-xl glass border border-white/20 shadow-2xl max-w-[240px]"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Issue Resolved!</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Streetlight on Oak Ave has been replaced successfully.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Glowing effect behind the map */}
            <div className="absolute -inset-10 bg-primary/20 blur-[100px] -z-20 opacity-40 animate-pulse" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
