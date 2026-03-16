"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  Shield,
  TrendingUp,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  Building2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { computePriorityScore, getPriorityLevel } from "@/lib/priority"

type Problem = Database["public"]["Tables"]["problems"]["Row"]

type StatusFilter = 'all' | 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved'
type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low'

const STATUS_COLORS: Record<string, string> = {
  reported: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  verified: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  assigned: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  in_progress: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
}

function exportToCSV(problems: Problem[]) {
  const headers = ['ID', 'Title', 'Category', 'Severity', 'Status', 'Address', 'Confirmed', 'Reported At']
  const rows = problems.map(p => [
    p.id.slice(0, 8),
    `"${p.title}"`,
    p.category,
    p.severity,
    p.status,
    `"${p.address || ''}"`,
    p.confirmed_count,
    new Date(p.created_at).toLocaleDateString('en-IN'),
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `civic-issues-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function exportToGeoJSON(problems: Problem[]) {
  const geojson = {
    type: 'FeatureCollection',
    features: problems.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        title: p.title,
        category: p.category,
        severity: p.severity,
        status: p.status,
        address: p.address,
        confirmed_count: p.confirmed_count,
        created_at: p.created_at,
      }
    }))
  }
  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `civic-issues-${new Date().toISOString().slice(0, 10)}.geojson`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AuthorityDashboardPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'created_at' | 'severity'>('priority')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function fetchProblems() {
    setLoading(true)
    const { data } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setProblems(data)
    setLoading(false)
  }

  useEffect(() => { fetchProblems() }, [])

  async function updateStatus(id: string, newStatus: Problem['status']) {
    setUpdatingId(id)
    await supabase.from('problems').update({ status: newStatus }).eq('id', id)
    setProblems(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
    setUpdatingId(null)
  }

  const filtered = useMemo(() => {
    let result = [...problems]
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter)
    if (severityFilter !== 'all') result = result.filter(p => p.severity === severityFilter)

    result.sort((a, b) => {
      if (sortBy === 'priority') {
        return computePriorityScore(b) - computePriorityScore(a)
      }
      if (sortBy === 'severity') {
        const sev = { critical: 4, high: 3, medium: 2, low: 1 }
        return (sev[b.severity] || 0) - (sev[a.severity] || 0)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return result
  }, [problems, statusFilter, severityFilter, sortBy])

  const stats = useMemo(() => {
    const total = problems.length
    const resolved = problems.filter(p => p.status === 'resolved').length
    const inProgress = problems.filter(p => p.status === 'in_progress').length
    const critical = problems.filter(p => p.severity === 'critical' && p.status !== 'resolved').length
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

    const resolutionTimes = problems
      .filter(p => p.status === 'resolved')
      .map(p => (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const avgResolutionDays = resolutionTimes.length > 0
      ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
      : 0

    return { total, resolved, inProgress, critical, resolutionRate, avgResolutionDays }
  }, [problems])

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Loading Authority Panel...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Authority Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Municipal management panel — manage, prioritize and resolve civic issues.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl font-bold gap-2" onClick={() => exportToGeoJSON(filtered)}>
            <Download className="w-4 h-4" /> GeoJSON
          </Button>
          <Button className="rounded-2xl font-bold gap-2" onClick={() => exportToCSV(filtered)}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" className="rounded-2xl" onClick={fetchProblems}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Issues', value: stats.total, icon: MapPin, color: 'bg-primary' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'bg-green-500' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-amber-500' },
          { label: 'Critical Open', value: stats.critical, icon: AlertTriangle, color: 'bg-red-500' },
          { label: 'Resolution Rate', value: `${stats.resolutionRate}%`, icon: TrendingUp, color: 'bg-blue-500' },
          { label: 'Avg. Resolution', value: `${stats.avgResolutionDays}d`, icon: Building2, color: 'bg-purple-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 shadow-xl rounded-[1.5rem] bg-card/50 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/40 shadow-xl rounded-[2rem] bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Filter:</span>
            </div>

            {/* Status filter */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'reported', 'verified', 'in_progress', 'resolved'] as StatusFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${statusFilter === s ? 'bg-primary text-white border-primary' : 'border-border/40 text-muted-foreground hover:border-primary/40'}`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border/40" />

            {/* Severity filter */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'critical', 'high', 'medium', 'low'] as SeverityFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${severityFilter === s ? 'bg-primary text-white border-primary' : 'border-border/40 text-muted-foreground hover:border-primary/40'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="ml-auto flex gap-2">
              {(['priority', 'severity', 'created_at'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${sortBy === s ? 'bg-primary text-white border-primary' : 'border-border/40 text-muted-foreground hover:border-primary/40'}`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  {s === 'created_at' ? 'Newest' : s}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="border-border/40 shadow-2xl rounded-[2rem] bg-card/30 backdrop-blur-xl overflow-hidden">
        <CardHeader className="p-6 pb-0 border-b border-border/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black tracking-tight">
              {filtered.length} Issue{filtered.length !== 1 ? 's' : ''} Found
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/20">
            {filtered.map((problem, idx) => {
              const score = computePriorityScore(problem)
              const priority = getPriorityLevel(score)
              return (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-6 hover:bg-muted/20 transition-colors"
                >
                  {/* Priority badge */}
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border shrink-0 ${priority.bgColor} ${priority.color}`}>
                    <span>{priority.emoji}</span>
                    {priority.label}
                    <span className="opacity-60">#{score}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{problem.title}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground capitalize">{problem.category.replace('_', ' ')}</span>
                      {problem.address && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{problem.address}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(problem.created_at).toLocaleDateString('en-IN')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ✓ {problem.confirmed_count} verified
                      </span>
                    </div>
                  </div>

                  {/* Severity */}
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border shrink-0 ${
                    problem.severity === 'critical' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                    problem.severity === 'high' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                    problem.severity === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                    'bg-green-500/10 text-green-600 border-green-500/20'
                  }`}>
                    {problem.severity}
                  </span>

                  {/* Status + Updater */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${STATUS_COLORS[problem.status]}`}>
                      {problem.status.replace('_', ' ')}
                    </span>
                    <select
                      className="text-[10px] font-black uppercase border border-border/40 rounded-xl px-2 py-1 bg-background cursor-pointer hover:border-primary transition-colors"
                      value={problem.status}
                      disabled={updatingId === problem.id}
                      onChange={(e) => updateStatus(problem.id, e.target.value as Problem['status'])}
                    >
                      <option value="reported">Reported</option>
                      <option value="verified">Verified</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    {updatingId === problem.id && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                  </div>
                </motion.div>
              )
            })}

            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-black text-muted-foreground uppercase tracking-widest">No issues match the current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
