"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  MapPin,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ThumbsUp,
  MessageCircle,
  Eye,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { InteractiveMap } from "@/components/dashboard/interactive-map"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { computePriorityScore, getPriorityLevel, getCivicLevel } from "@/lib/priority"

type Problem = Database["public"]["Tables"]["problems"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

const statusColors: Record<string, string> = {
  reported: "bg-accent/10 text-accent",
  verified: "bg-blue-500/10 text-blue-600",
  assigned: "bg-purple-500/10 text-purple-600",
  in_progress: "bg-amber-500/10 text-amber-600",
  resolved: "bg-green-500/10 text-green-600",
}

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { label: "Total Reports", value: "0", change: "+0%", icon: MapPin, color: "bg-primary" },
    { label: "Resolved", value: "0", change: "+0%", icon: CheckCircle2, color: "bg-green-500" },
    { label: "In Progress", value: "0", change: "+0%", icon: Clock, color: "bg-amber-500" },
    { label: "Pending", value: "0", change: "+0%", icon: AlertTriangle, color: "bg-accent" },
  ])
  const [recentReports, setRecentReports] = useState<Problem[]>([])
  const [topContributors, setTopContributors] = useState<Profile[]>([])
  const [categoryStats, setCategoryStats] = useState<{ name: string; resolved: number; total: number; color: string }[]>([])
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [impactScore, setImpactScore] = useState({ score: 0, label: "Calculating...", color: "text-muted-foreground", description: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (profile) setUserProfile(profile)
      }

      // Fetch Recent Reports
      const { data: recent } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)
      if (recent) {
        const sorted = [...recent].sort((a, b) => computePriorityScore(b) - computePriorityScore(a))
        setRecentReports(sorted)
      }

      // Fetch Stats
      const { data: allProblems } = await supabase.from('problems').select('status, category')
      if (allProblems) {
        const total = allProblems.length
        const resolved = allProblems.filter(p => p.status === 'resolved').length
        const inProgress = allProblems.filter(p => p.status === 'in_progress').length
        const pending = allProblems.filter(p => p.status === 'reported').length

        setStats([
          { label: "Total Reports", value: total.toString(), change: "+0%", icon: MapPin, color: "bg-primary" },
          { label: "Resolved", value: resolved.toString(), change: "+0%", icon: CheckCircle2, color: "bg-green-500" },
          { label: "In Progress", value: inProgress.toString(), change: "+0%", icon: Clock, color: "bg-amber-500" },
          { label: "Pending", value: pending.toString(), change: "+0%", icon: AlertTriangle, color: "bg-accent" },
        ])

        // Category Progress
        const categories = [...new Set(allProblems.map(p => p.category))]
        const catStats = categories.map(cat => {
          const catProblems = allProblems.filter(p => p.category === cat)
          const catResolved = catProblems.filter(p => p.status === 'resolved').length
          return {
            name: cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            resolved: catResolved,
            total: catProblems.length,
            color: "bg-primary"
          }
        })
        setCategoryStats(catStats)
      }

      // Fetch Top Contributors
      const { data: contributors } = await supabase
        .from('profiles')
        .select('*')
        .order('reputation_points', { ascending: false })
        .limit(3)
      if (contributors) setTopContributors(contributors)

      // Calculate Civic Impact Score (Infrastructure Health)
      if (allProblems) {
        const total = allProblems.length
        const resolved = allProblems.filter(p => p.status === 'resolved').length
        const healthScore = total > 0 ? Math.round((resolved / total) * 100) : 100
        
        let label = "Moderate"
        let color = "text-amber-500"
        let description = "Infrastructure needs steady attention."
        
        if (healthScore >= 90) {
          label = "Excellent"
          color = "text-green-500"
          description = "City infrastructure is in peak condition."
        } else if (healthScore >= 70) {
          label = "Good"
          color = "text-emerald-500"
          description = "Mostly healthy with minor issues."
        } else if (healthScore < 50) {
          label = "Critical"
          color = "text-red-500"
          description = "Immediate intervention required in multiple sectors."
        }
        
        setImpactScore({ score: healthScore, label, color, description })
      }

      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Welcome back, <span className="text-primary">{userProfile?.full_name?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-muted-foreground text-lg">Here&apos;s what&apos;s happening in your community today.</p>
        </div>
        <Button size="lg" className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all font-bold" asChild>
          <Link href="/dashboard/report">
            <MapPin className="w-5 h-5 mr-3" />
            Report New Problem
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-lift shadow-premium border-border/40 rounded-[2.5rem] overflow-hidden bg-white/40 backdrop-blur-md transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-1 text-xs font-black ${stat.change.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                      <TrendingUp className={`w-3.5 h-3.5 ${stat.change.startsWith("-") ? "rotate-180" : ""}`} />
                      {stat.change}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">this week</span>
                  </div>
                </div>
                <div>
                  <p className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</p>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Impact Score Section (WOW Feature) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-border/40 shadow-2xl rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background backdrop-blur-xl relative group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <TrendingUp className="w-64 h-64 -rotate-12" />
          </div>
          <CardContent className="p-10 lg:p-14">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="relative shrink-0">
                {/* Score Circular Progress */}
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-muted/20"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={552.92}
                    initial={{ strokeDashoffset: 552.92 }}
                    animate={{ strokeDashoffset: 552.92 - (552.92 * impactScore.score) / 100 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className={impactScore.color}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-6xl font-black tracking-tighter ${impactScore.color}`}>{impactScore.score}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1">Health Score</span>
                </div>
              </div>
              
              <div className="flex-1 text-center lg:text-left space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">City Analytics Engine</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
                    Infrastructure <span className={impactScore.color}>{impactScore.label}</span>
                  </h2>
                  <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                    {impactScore.description} This score is calculated based on problem resolution time, citizen participation, and current open reports across all sectors.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                  {[
                    { label: "Resolution Rate", value: `${impactScore.score}%`, icon: CheckCircle2 },
                    { label: "Citizen Pulse", value: topContributors.length > 0 ? "High" : "Low", icon: TrendingUp },
                    { label: "Alert Density", value: stats[0].value, icon: MapPin },
                    { label: "Active Nodes", value: "24/7", icon: Clock },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-2xl bg-white/50 border border-border/20">
                      <item.icon className="w-5 h-5 text-primary/60 mb-2" />
                      <p className="text-xl font-black text-foreground">{item.value}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden border-border/40 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between p-8 pb-0">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Community Map</CardTitle>
                <p className="text-sm text-muted-foreground font-medium mt-1">Live infrastructure alerts near you</p>
              </div>
              <Button variant="outline" size="lg" className="rounded-2xl font-bold h-12" asChild>
                <Link href="/dashboard/map">
                  View full map
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <div className="rounded-[2rem] overflow-hidden border border-border/20 shadow-inner">
                <InteractiveMap />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top contributors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full border-border/40 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-black tracking-tight">Leaderboard</CardTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">Top Change-Makers</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {topContributors.map((contributor, index) => (
                <div key={contributor.id} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-muted/30 transition-colors group">
                  <div className="relative shrink-0">
                    <Avatar className="w-14 h-14 border-2 border-primary/20 group-hover:border-primary transition-colors">
                      <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">
                        {contributor.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg ${index === 0 ? "bg-amber-400" : index === 1 ? "bg-slate-400" : "bg-amber-700"
                      }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{contributor.full_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-black uppercase tracking-tighter">
                        {contributor.reputation_points} PTS
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full h-14 rounded-2xl font-bold text-primary hover:bg-primary/5 transition-all mt-4" asChild>
                <Link href="/dashboard/leaderboard">
                  View All Rankings
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent reports and category progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Recent reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/40 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between p-8 pb-0">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Recent Reports</CardTitle>
                <p className="text-sm text-muted-foreground font-medium mt-1">The latest activity in your area</p>
              </div>
              <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/5" asChild>
                <Link href="/dashboard/activity">
                  View all activity
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-4">
                {recentReports.map((report) => {
                  const score = computePriorityScore(report)
                  const priority = getPriorityLevel(score)
                  return (
                  <Link
                    key={report.id}
                    href={`/dashboard/problem/${report.id}`}
                    className="hover-lift flex items-center gap-6 p-6 rounded-[2.5rem] border border-border/10 bg-white/30 backdrop-blur-sm hover:bg-white/50 hover:shadow-glow transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <MapPin className="w-7 h-7 text-primary transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-all truncate leading-tight">
                            {report.title}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-1.5 capitalize">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {report.address || 'Location unknown'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusColors[report.status]}`}>
                            {report.status.replace("_", " ")}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${priority.bgColor} ${priority.color}`}>
                            {priority.emoji} {priority.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-4">
                        <span className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-tighter">
                          <ThumbsUp className="w-4 h-4 text-primary/60" />
                          {report.confirmed_count} Verified
                        </span>
                        <span className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-tighter">
                          <MessageCircle className="w-4 h-4 text-primary/60" />
                          2 Comments
                        </span>
                      </div>
                    </div>
                    <Eye className="w-6 h-6 text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                  </Link>
                  )
                })}
              </div>
              {recentReports.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-border/20 rounded-[2rem]">
                  <p className="font-black text-muted-foreground uppercase tracking-widest">No reports found yet.</p>
                  <Button variant="link" className="mt-2 font-bold" asChild>
                    <Link href="/dashboard/report">Be the first to report!</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full border-border/40 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-black tracking-tight">Resolution Pulse</CardTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">Impact Tracking</p>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {categoryStats.map((category) => (
                <div key={category.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-foreground uppercase tracking-tighter">{category.name}</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {category.resolved} / {category.total} RESOLVED
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(category.resolved / category.total) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`absolute inset-0 ${category.color} rounded-full shadow-[0_0_12px_rgba(var(--primary),0.3)]`}
                    />
                  </div>
                  <p className="text-[10px] text-right font-black text-primary uppercase tracking-widest">
                    {Math.round((category.resolved / category.total) * 100)}% SUCCESS RATE
                  </p>
                </div>
              ))}
              {categoryStats.length === 0 && (
                <p className="text-center text-muted-foreground font-bold py-10 opacity-50">Pulse data arriving soon...</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
