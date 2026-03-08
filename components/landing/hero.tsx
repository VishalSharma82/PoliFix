"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MapPin, CheckCircle2, Users, Zap } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background decorations - More dynamic */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px] animate-float" />

      {/* Floating particles simulation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary/20"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
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
            <Badge variant="outline" className="w-fit gap-2 px-4 py-2 border-primary/20 bg-primary/5 text-primary backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Empowering 12,500+ Local Action Takers
            </Badge>

            <div className="flex flex-col gap-6">
              <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1]">
                Map Problems.{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent animate-gradient">
                  Fix Cities.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Connect with your community to report infrastructure gaps, verify local issues, and drive real-world solutions through data-driven advocacy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="h-14 px-8 text-lg font-semibold gap-2 group shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95">
                <Link href="/dashboard/report">
                  <MapPin className="h-5 w-5" />
                  Report a Problem
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg font-semibold backdrop-blur-sm border-primary/20 hover:bg-primary/5 transition-all">
                <Link href="/dashboard">Explore Map Live</Link>
              </Button>
            </div>

            {/* Micro-activity feed */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Activity</p>
              <div className="flex -space-x-3 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-background bg-muted overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                      alt="User avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-background bg-primary text-[10px] font-bold text-primary-foreground">
                  +1.2k
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Rahul</span> just confirmed a <span className="text-primary font-medium">water leak</span> in Sector 4
              </p>
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
