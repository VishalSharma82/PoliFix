"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  MapPin,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  ChevronDown,
  Eye,
  TrendingUp,
  Loader2,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type Activity = {
  id: string
  type: "report" | "verify" | "comment" | "resolve"
  user: { name: string; initials: string }
  action: string
  problem: { id: string; title: string }
  time: string
  timestamp: string
  icon: any
  color: string
  comment?: string
}

export default function ActivityPage() {
  const [filter, setFilter] = useState("all")
  const [activities, setActivities] = useState<Activity[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [resolved, setResolved] = useState<any[]>([])
  const [stats, setStats] = useState({ reports: 0, verifications: 0, resolved: 0, comments: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true)

      // 1. Fetch Reports
      const { data: reports } = await supabase
        .from('problems')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(10)

      // 2. Fetch Verifications
      const { data: verifications } = await supabase
        .from('verifications')
        .select('*, profiles(*), problems(*)')
        .order('created_at', { ascending: false })
        .limit(10)

      // 3. Fetch Comments
      const { data: comments } = await supabase
        .from('comments')
        .select('*, profiles(*), problems(*)')
        .order('created_at', { ascending: false })
        .limit(10)

      // Combine and format
      const combined: Activity[] = []

        ; (reports as any)?.forEach((r: any) => {
          combined.push({
            id: `report-${r.id}`,
            type: r.status === 'resolved' ? 'resolve' : 'report',
            user: { name: r.profiles?.full_name || 'Citizen', initials: r.profiles?.full_name?.[0] || 'C' },
            action: r.status === 'resolved' ? "resolved the issue" : "reported a new problem",
            problem: { id: r.id, title: r.title },
            time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: r.created_at,
            icon: r.status === 'resolved' ? CheckCircle2 : AlertTriangle,
            color: r.status === 'resolved' ? "bg-green-500" : "bg-accent"
          })
        })

        ; (verifications as any)?.forEach((v: any) => {
          combined.push({
            id: `verify-${v.id}`,
            type: "verify",
            user: { name: v.profiles?.full_name || 'Citizen', initials: v.profiles?.full_name?.[0] || 'C' },
            action: "verified",
            problem: { id: v.problems?.id || '', title: v.problems?.title || '' },
            time: new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: v.created_at,
            icon: ThumbsUp,
            color: "bg-primary"
          })
        })

        ; (comments as any)?.forEach((c: any) => {
          combined.push({
            id: `comment-${c.id}`,
            type: "comment",
            user: { name: c.profiles?.full_name || 'Citizen', initials: c.profiles?.full_name?.[0] || 'C' },
            action: "commented on",
            problem: { id: c.problems?.id || '', title: c.problems?.title || '' },
            comment: c.content,
            time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: c.created_at,
            icon: MessageSquare,
            color: "bg-blue-500"
          })
        })

      setActivities(combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))

      // Fetch Trending (Most confirmed)
      const { data: trendData } = await supabase
        .from('problems')
        .select('*')
        .order('confirmed_count', { ascending: false })
        .limit(4)

      const trendingWithBoost = (trendData || []).map((item: any) => {
        return { ...(item || {}), boost: Math.floor(Math.random() * 50) + 10 }
      })
      setTrending(trendingWithBoost)

      // Fetch Recently Resolved
      const { data: resData } = await supabase
        .from('problems')
        .select('*')
        .eq('status', 'resolved')
        .order('created_at', { ascending: false })
        .limit(3)
      setResolved(resData || [])

      // Daily Stats (Mocked counts based on total for now)
      setStats({
        reports: reports?.length || 0,
        verifications: verifications?.length || 0,
        resolved: resData?.length || 0,
        comments: comments?.length || 0
      })

      setLoading(false)
    }

    fetchActivity()
  }, [])

  const filteredActivities = filter === "all"
    ? activities
    : activities.filter((a) => a.type === filter)

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Syncing Community Pulse...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Community Feed</h1>
          <p className="text-muted-foreground text-lg">Real-time civic impact and collective updates.</p>
        </div>
        <Button size="lg" className="rounded-2xl font-bold h-14" asChild>
          <Link href="/dashboard/report">
            <Zap className="w-4 h-4 mr-2" />
            Join the Effort
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 shadow-2xl rounded-[3rem] bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black tracking-tight">Recent Activity</CardTitle>
                <Button variant="outline" className="rounded-xl font-bold h-10 border-border/40">
                  <Filter className="w-4 h-4 mr-2" />
                  Smart Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 lg:p-10">
              <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
                <TabsList className="bg-muted/40 p-1 rounded-xl h-12 border border-border/20 mb-8 overflow-x-auto no-scrollbar">
                  {["all", "report", "verify", "resolve", "comment"].map(t => (
                    <TabsTrigger key={t} value={t} className="rounded-lg px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full">
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={filter} className="mt-0 space-y-2">
                  {filteredActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-6 p-6 rounded-[2rem] hover:bg-muted/30 transition-all group"
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-14 h-14 border-2 border-primary/20 group-hover:border-primary transition-all">
                          <AvatarFallback className="bg-background text-foreground font-black text-lg">
                            {activity.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-2xl ${activity.color} flex items-center justify-center shadow-lg border-2 border-background`}>
                          <activity.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-base text-foreground leading-snug">
                          <span className="font-black tracking-tight">{activity.user.name}</span>
                          {" "}
                          <span className="text-muted-foreground font-bold">{activity.action}</span>
                          {" "}
                          <Link
                            href={`/dashboard/problem/${activity.problem.id}`}
                            className="font-black text-primary hover:text-accent transition-colors tracking-tight"
                          >
                            {activity.problem.title.includes('ROLE_KEY') 
                              ? "Infrastructure Maintenance Required" 
                              : activity.problem.title}
                          </Link>
                        </p>
                        {activity.comment && (
                          <div className="mt-3 p-4 bg-background/50 rounded-2xl border border-border/20 italic text-sm text-foreground/80 font-medium leading-relaxed">
                            &quot;{activity.comment}&quot;
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{activity.time}</p>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-accent transition-colors">Appreciate Effort</button>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/problem/${activity.problem.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 hidden sm:block"
                      >
                        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl hover:bg-primary/10 text-primary">
                          <Eye className="w-6 h-6" />
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                  {filteredActivities.length === 0 && (
                    <div className="py-20 text-center border-4 border-dashed border-border/20 rounded-[2.5rem]">
                      <p className="font-black text-muted-foreground uppercase tracking-widest opacity-50">No activity in this category yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-10 pt-10 border-t border-border/20 text-center">
                <Button variant="outline" className="h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest border-border/40 hover:bg-muted/50 transition-all">
                  Load Historical Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Trending problems */}
          <Card className="border-border/40 shadow-2xl rounded-[2.5rem] bg-card/50 backdrop-blur-xl">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                Trending Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {trending.map((problem, index) => (
                <Link
                  key={problem.id}
                  href={`/dashboard/problem/${problem.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all group"
                >
                  <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-black shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate tracking-tight">{problem.title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                      {problem.confirmed_count} Verified Citizens
                    </p>
                  </div>
                  <span className="text-[10px] text-green-600 font-black uppercase bg-green-500/10 px-2 py-1 rounded-md">+{problem.boost}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recently resolved */}
          <Card className="border-border/40 shadow-2xl rounded-[2.5rem] bg-card/50 backdrop-blur-xl">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                Civic Wins
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {resolved.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/dashboard/problem/${problem.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all border border-border/20"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate tracking-tight">{problem.title}</p>
                    <p className="text-[10px] font-bold text-green-600 uppercase mt-1">Recently Resolved</p>
                  </div>
                </Link>
              ))}
              {resolved.length === 0 && (
                <p className="text-center py-6 text-[10px] font-black text-muted-foreground uppercase opacity-50 border-2 border-dashed border-border/20 rounded-2xl">Awaiting resolutions...</p>
              )}
            </CardContent>
          </Card>

          {/* Today's Metrics */}
          <Card className="border-border/40 shadow-2xl rounded-[2.5rem] bg-primary text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <CardHeader className="p-8 pb-4 relative">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Cycle-24 Impact</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "New Alerts", value: stats.reports },
                  { label: "Verifications", value: stats.verifications },
                  { label: "Resolved", value: stats.resolved },
                  { label: "Engagement", value: stats.comments },
                ].map(m => (
                  <div key={m.label} className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-center">
                    <p className="text-2xl font-black tracking-tighter">{m.value}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
