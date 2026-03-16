"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"
import {
  TrendingUp,
  CheckCircle2,
  MapPin,
  Users,
  Zap,
  BarChart2,
  Loader2,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCivicLevel } from "@/lib/priority"

type Problem = Database["public"]["Tables"]["problems"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

const CATEGORY_COLORS: Record<string, string> = {
  pothole: '#ef4444',
  garbage: '#f97316',
  streetlight: '#eab308',
  water_leak: '#3b82f6',
  road_damage: '#8b5cf6',
  safety_issue: '#ec4899',
}

const STATUS_COLORS_PIE = ['#f97316', '#3b82f6', '#8b5cf6', '#eab308', '#22c55e']

export default function CityStatsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [weekProblems, setWeekProblems] = useState<Problem[]>([])
  const [topContributors, setTopContributors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [{ data: allProblems }, { data: weekData }, { data: contributors }] = await Promise.all([
        supabase.from('problems').select('*'),
        supabase.from('problems').select('*').gte('created_at', oneWeekAgo),
        supabase.from('profiles').select('*').order('reputation_points', { ascending: false }).limit(5),
      ])

      if (allProblems) setProblems(allProblems)
      if (weekData) setWeekProblems(weekData)
      if (contributors) setTopContributors(contributors)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Loading City Data...</p>
      </div>
    )
  }

  const total = problems.length
  const resolved = problems.filter(p => p.status === 'resolved').length
  const weekResolved = weekProblems.filter(p => p.status === 'resolved').length
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  // Category breakdown
  const categories = ['pothole', 'garbage', 'streetlight', 'water_leak', 'road_damage', 'safety_issue']
  const categoryData = categories.map(cat => ({
    name: cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    total: problems.filter(p => p.category === cat).length,
    resolved: problems.filter(p => p.category === cat && p.status === 'resolved').length,
    fill: CATEGORY_COLORS[cat],
  })).filter(c => c.total > 0)

  // Status breakdown for pie
  const statusLabels = ['reported', 'verified', 'assigned', 'in_progress', 'resolved']
  const pieData = statusLabels
    .map((s, i) => ({ name: s.replace('_', ' '), value: problems.filter(p => p.status === s).length, color: STATUS_COLORS_PIE[i] }))
    .filter(s => s.value > 0)

  const mostCommonCategory = categoryData.sort((a, b) => b.total - a.total)[0]?.name || 'N/A'

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <BarChart2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">City Transparency</h1>
          <p className="text-muted-foreground">Public metrics on civic issue reporting and resolution in your city.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Reported This Week', value: weekProblems.length, icon: Calendar, color: 'bg-primary', sub: 'new issues' },
          { label: 'Resolved This Week', value: weekResolved, icon: CheckCircle2, color: 'bg-green-500', sub: 'fixed issues' },
          { label: 'Overall Resolution', value: `${resolutionRate}%`, icon: TrendingUp, color: 'bg-blue-500', sub: 'repair efficiency' },
          { label: 'Most Common Type', value: mostCommonCategory, icon: MapPin, color: 'bg-amber-500', sub: 'top category' },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/40 shadow-xl rounded-[2rem] bg-card/50 backdrop-blur-sm h-full">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center mb-4 shadow-md`}>
                  <m.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black text-foreground tracking-tight leading-none">{m.value}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{m.sub}</p>
                <p className="text-sm font-bold text-muted-foreground mt-2">{m.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Bar Chart: Issues by Category */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
          <Card className="border-border/40 shadow-xl rounded-[2rem] bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="text-xl font-black tracking-tight">Issues by Category</CardTitle>
              <p className="text-sm text-muted-foreground">Total vs. resolved per type</p>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(128,128,128,0.2)', background: 'var(--background)' }}
                    labelStyle={{ fontWeight: 700 }}
                  />
                  <Bar dataKey="total" name="Total" fill="rgba(109,40,217,0.2)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" radius={[6, 6, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart: Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card className="border-border/40 shadow-xl rounded-[2rem] bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="text-xl font-black tracking-tight">Status Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">Pipeline overview</p>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(128,128,128,0.2)', background: 'var(--background)' }}
                  />
                  <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Contributors */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border/40 shadow-xl rounded-[2rem] bg-card/50 backdrop-blur-sm">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl font-black tracking-tight">Top Contributors This Week</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {topContributors.map((c, i) => {
                const level = getCivicLevel(c.reputation_points)
                return (
                  <div key={c.id} className="flex flex-col items-center gap-3 p-5 rounded-[1.5rem] border border-border/20 bg-background/50 hover:bg-muted/20 transition-colors text-center">
                    <div className="relative">
                      <Avatar className="w-14 h-14 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-black">
                          {c.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                        #{i + 1}
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-sm text-foreground">{c.full_name}</p>
                      <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${level.bgColor} ${level.color} ${level.borderColor}`}>
                        {level.emoji} {level.title}
                      </div>
                      <p className="text-xs font-black text-primary mt-2">{c.reputation_points} pts</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How it works / transparency note */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-border/40 shadow-xl rounded-[2rem] bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shrink-0 shadow-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Committed to Transparency</h3>
              <p className="text-muted-foreground mt-1 leading-relaxed">
                All civic issue data is publicly available. Citizens can track every report from submission through resolution.
                These metrics update in real-time as issues are reported and resolved by city teams.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
