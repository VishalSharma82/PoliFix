"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Trophy,
  Zap,
  Activity,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { InteractiveMap } from "@/components/dashboard/interactive-map"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { computePriorityScore, getPriorityLevel, getCivicLevel } from "@/lib/priority"

type Problem = Database["public"]["Tables"]["problems"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

const statusColors: Record<string, string> = {
  reported:    "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  verified:    "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  assigned:    "bg-purple-500/10 text-purple-600 border border-purple-500/20",
  in_progress: "bg-orange-500/10 text-orange-600 border border-orange-500/20",
  resolved:    "bg-green-500/10 text-green-600 border border-green-500/20",
}

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { label: "Active Issues", value: "0", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Community Verified", value: "0", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Resolved", value: "0", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "City Reputation", value: "0", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
  ])
  const [recentReports, setRecentReports] = useState<Problem[]>([])
  const [topContributors, setTopContributors] = useState<Profile[]>([])
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profile) setUserProfile(profile)
      }

      const { data: problems } = await supabase.from('problems').select('*').order('created_at', { ascending: false })
      if (problems) {
        setRecentReports(problems.slice(0, 6))
        
        const active = problems.filter(p => p.status !== 'resolved').length
        const resolved = problems.filter(p => p.status === 'resolved').length
        const verified = problems.filter(p => p.status === 'verified' || p.status === 'assigned').length

        setStats([
          { label: "Active Issues", value: active.toString(), icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Community Verified", value: verified.toString(), icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Resolved", value: resolved.toString(), icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "City Reputation", value: userProfile?.reputation_points?.toString() || "0", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
        ])
      }

      const { data: contributors } = await supabase.from('profiles').select('*').order('reputation_points', { ascending: false }).limit(5)
      if (contributors) setTopContributors(contributors)

      setLoading(false)
    }
    fetchDashboardData()
  }, [])

  if (loading) return null

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border shadow-premium flex items-center gap-4 group hover:border-primary/30 transition-all"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Main Systematic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Issues Feed (8 Columns) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h2 className="text-xl font-black tracking-tight uppercase italic">Active Civic Issues</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest gap-2" asChild>
              <Link href="/dashboard/activity">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReports.map((item, i) => {
               const priority = getPriorityLevel(computePriorityScore(item))
               return (
                 <motion.div
                   key={item.id}
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.05 }}
                 >
                   <Link href={`/dashboard/problem/${item.id}`} className="block h-full p-5 bg-card border border-border shadow-premium rounded-2xl hover:border-primary/40 transition-all group">
                     <div className="flex items-start justify-between mb-4">
                        <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", statusColors[item.status])}>
                          {item.status.replace('_', ' ')}
                        </span>
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", priority.bgColor)}>
                           <span className="text-sm">{priority.emoji}</span>
                        </div>
                     </div>
                     <h3 className="text-sm font-bold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                     <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">{item.description}</p>
                     
                     <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground">
                           <MapPin className="w-3 h-3" />
                           <span className="text-[10px] font-bold uppercase tracking-tighter truncate max-w-[100px]">{(item as any).location_name || 'City Point'}</span>
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                     </div>
                   </Link>
                 </motion.div>
               )
            })}
          </div>

          {/* Call to Action */}
          <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-48 h-48 -rotate-12" />
             </div>
             <div className="relative z-10 max-w-md">
                <h3 className="text-2xl font-black tracking-tight mb-2">Be the Change Your City Needs</h3>
                <p className="text-indigo-100 text-sm font-medium mb-6 opacity-80">Report infrastructure issues, verify reports from fellow citizens, and help us build a better tomorrow.</p>
                <div className="flex gap-4">
                  <Button variant="secondary" className="font-bold rounded-xl h-11 px-6 shadow-xl" asChild>
                    <Link href="/dashboard/report">Fast Report</Link>
                  </Button>
                </div>
             </div>
          </div>
        </section>

        {/* Right: Side Widgets (4 Columns) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Active Map Mini */}
          <div className="p-6 bg-card border border-border shadow-premium rounded-2xl flex flex-col gap-4 overflow-hidden h-[300px]">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">City Pulse</h3>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             </div>
             <div className="flex-1 rounded-xl overflow-hidden border border-border bg-muted relative">
                <InteractiveMap />
                <div className="absolute inset-x-2 bottom-2 p-2 bg-background/80 backdrop-blur-md border border-border rounded-lg flex items-center justify-between text-[9px] font-bold uppercase pointer-events-none">
                   <span>Hotspots Overview</span>
                   <Link href="/dashboard/map" className="text-primary pointer-events-auto">Expand</Link>
                </div>
             </div>
          </div>

          {/* Leaders */}
          <div className="p-6 bg-card border border-border shadow-premium rounded-2xl space-y-6">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <Trophy className="w-4 h-4 text-primary" />
                   <h3 className="text-sm font-black uppercase tracking-widest">Top Contributors</h3>
                </div>
                <Users className="w-4 h-4 text-muted-foreground opacity-30" />
             </div>
             <div className="space-y-4">
                {topContributors.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-9 h-9 border border-border">
                             <AvatarFallback className="text-[10px] font-black">{c.full_name?.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center border-2 border-card">
                             {i+1}
                          </div>
                        </div>
                        <div>
                           <p className="text-xs font-bold leading-none">{c.full_name}</p>
                           <p className="text-[9px] text-muted-foreground font-medium mt-1 uppercase tracking-widest italic">{getCivicLevel(c.reputation_points || 0).title}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c.reputation_points}</span>
                  </div>
                ))}
             </div>
             <Button variant="outline" className="w-full text-[10px] font-black uppercase h-10 rounded-xl mt-2 tracking-[0.2em]" asChild>
                <Link href="/dashboard/leaderboard">Full Ranking</Link>
             </Button>
          </div>

          {/* Tips / Jarvis News */}
          <div className="p-6 bg-muted/40 border border-border rounded-2xl relative overflow-hidden">
             <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Pro Tip</h3>
             </div>
             <p className="text-xs text-muted-foreground leading-relaxed italic">
                "Verified reports are 3x more likely to be resolved by authorities. Make sure to upload clear photos!"
             </p>
          </div>
        </aside>

      </div>
    </div>
  )
}
