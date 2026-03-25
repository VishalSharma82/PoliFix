"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MapPin,
  ThumbsUp,
  MessageCircle,
  CheckCircle2,
  Calendar,
  Award,
  TrendingUp,
  Edit2,
  Camera,
  Mail,
  MapPinned,
  Clock,
  Eye,
  Settings,
  Loader2,
  Star,
  Zap,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Problem = Database["public"]["Tables"]["problems"]["Row"]

const statusColors: Record<string, string> = {
  reported: "bg-accent/10 text-accent",
  verified: "bg-blue-500/10 text-blue-600",
  assigned: "bg-purple-500/10 text-purple-600",
  in_progress: "bg-amber-500/10 text-amber-600",
  resolved: "bg-green-500/10 text-green-600",
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [myReports, setMyReports] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    reports: 0,
    verifications: 0,
    resolved: 0,
    comments: 0
  })

  useEffect(() => {
    async function fetchProfileData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) setProfile(profileData as Profile)

      // Fetch My Reports
      const { data: reports } = await supabase
        .from('problems')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })

      if (reports) {
        setMyReports(reports as Problem[])
        const resolvedCount = (reports as Problem[]).filter(r => r.status === 'resolved').length

        // Fetch Verifications (Simplified count)
        const { count: vCount } = await supabase
          .from('verifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Fetch Comments
        const { count: cCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setStats({
          reports: reports.length,
          verifications: vCount || 0,
          resolved: resolvedCount,
          comments: cCount || 0
        })
      }

      setLoading(false)
    }

    fetchProfileData()
  }, [router])

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return
    
    try {
      const response = await fetch(`/api/v1/problems/${reportId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error("Failed to delete report")
      
      setMyReports(prev => prev.filter(r => r.id !== reportId))
      setStats(prev => ({ 
        ...prev, 
        reports: prev.reports - 1,
        resolved: myReports.find(r => r.id === reportId)?.status === 'resolved' ? prev.resolved - 1 : prev.resolved
      }))
    } catch (err) {
      console.error(err)
      alert("Failed to delete report. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Loading Identity...</p>
      </div>
    )
  }

  const reputation = profile?.reputation_points || 0
  const level = Math.floor(reputation / 100) + 1
  const nextLevelRep = level * 100
  const progressPercent = (reputation % 100)

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Profile header */}
      <Card className="border-border/40 shadow-2xl rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-xl relative">
        {/* Full-height background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-r from-blue-600/20 via-indigo-500/10 to-transparent pointer-events-none" />
        <CardContent className="p-8 lg:p-12 relative">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Avatar */}
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] border-4 border-white/60 shadow-2xl overflow-hidden group bg-gradient-to-br from-blue-600 to-indigo-700">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarFallback className="bg-transparent text-white text-4xl font-black">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </button>
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xl border-4 border-background rotate-12">
                <Star className="w-6 h-6 fill-current" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                    <h1 className="text-4xl font-black text-foreground tracking-tight">{profile?.full_name}</h1>
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20">
                      Level {level} Citizen
                    </span>
                  </div>
                  <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                    {profile?.bio || "No bio provided. Update your profile to tell the community about yourself."}
                  </p>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-8 text-sm font-bold text-muted-foreground">
                    <span className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl">
                      <Mail className="w-4 h-4 text-primary" />
                      {user?.email || 'Email not linked'}
                    </span>
                    <span className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl">
                      <MapPinned className="w-4 h-4 text-primary" />
                      {profile?.location || 'Location not set'}
                    </span>
                    <span className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl">
                      <Calendar className="w-4 h-4 text-primary" />
                      Joined {new Date(profile?.created_at || user?.created_at || '').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold gap-2" asChild>
                    <Link href="/dashboard/settings">
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12" asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Level progress */}
              <div className="mt-10 p-8 bg-muted/20 rounded-[2rem] border border-border/20 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-black text-foreground uppercase tracking-widest text-xs">Citizen Reputation</span>
                      <p className="text-2xl font-black text-primary tracking-tighter">{reputation} PTS</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-background px-4 py-1.5 rounded-full border border-border/40">
                    Next Level: {nextLevelRep}
                  </span>
                </div>
                <div className="relative h-4 rounded-full bg-background overflow-hidden border border-border/40 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                  />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-3 text-right">
                  {100 - progressPercent}% Experience needed to level {level + 1}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Reports Filed", value: stats.reports, icon: MapPin, color: "bg-primary" },
          { label: "Community Verifications", value: stats.verifications, icon: ThumbsUp, color: "bg-green-500" },
          { label: "Issues Resolved", value: stats.resolved, icon: CheckCircle2, color: "bg-amber-500" },
          { label: "Community Activity", value: stats.comments, icon: MessageCircle, color: "bg-blue-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/40 shadow-xl rounded-[2rem] bg-card/50 backdrop-blur-sm overflow-hidden group hover:scale-105 transition-all">
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs section */}
      <Tabs defaultValue="reports" className="space-y-8">
        <TabsList className="bg-muted/40 p-1.5 rounded-2xl h-16 border border-border/20 backdrop-blur-md">
          <TabsTrigger value="reports" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
            My Impact Reports
          </TabsTrigger>
          <TabsTrigger value="badges" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all h-full">
            Civic Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card className="border-border/40 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-8 lg:p-10 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Report History</CardTitle>
                  <p className="text-sm font-medium text-muted-foreground mt-1">Tracking your contributions to the city</p>
                </div>
                <Button variant="ghost" className="font-bold text-primary hover:bg-primary/5 rounded-xl">Export Data</Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 lg:p-10 space-y-4">
              {myReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/dashboard/problem/${report.id}`}
                  className="flex items-center gap-6 p-6 rounded-[2rem] border border-border/20 hover:bg-background/80 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <MapPin className="w-7 h-7 text-primary transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-all truncate leading-tight">
                        {report.title}
                      </h3>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm self-start sm:self-center ${statusColors[report.status]}`}>
                        {report.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <span className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                        <ThumbsUp className="w-4 h-4 text-primary/60" />
                        {report.confirmed_count} Confirmed
                      </span>
                      <span className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                        <Clock className="w-4 h-4 text-primary/60" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-10 h-10 rounded-xl text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      onClick={(e) => handleDeleteReport(report.id, e)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    <Eye className="w-6 h-6 text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 hidden sm:block" />
                  </div>
                </Link>
              ))}
              {myReports.length === 0 && (
                <div className="py-24 text-center border-4 border-dashed border-border/20 rounded-[3rem]">
                  <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-6">
                    <MapPinned className="w-10 h-10 text-muted-foreground opacity-30" />
                  </div>
                  <p className="font-black text-muted-foreground uppercase tracking-widest mb-6">No reports filed yet.</p>
                  <Button size="lg" className="rounded-2xl font-bold shadow-xl shadow-primary/20 h-14 px-10" asChild>
                    <Link href="/dashboard/report">Submit Your First Report</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "First Responder", desc: "Submitted your first community report", icon: Zap, pts: 10, earned: stats.reports >= 1 },
              { name: "Public Servant", desc: "Filed 10+ infrastructure reports", icon: MapPinned, pts: 50, earned: stats.reports >= 10 },
              { name: "Community Pillar", desc: "Reached 100+ points in reputation", icon: Award, pts: 100, earned: reputation >= 100 },
              { name: "The Auditor", desc: "Verified 50 community problems", icon: Eye, pts: 25, earned: stats.verifications >= 50 },
              { name: "Voice of Reason", desc: "Posted 25 helpful comments", icon: MessageCircle, pts: 15, earned: stats.comments >= 25 },
              { name: "Problem Slayer", desc: "Had 5+ reports completely resolved", icon: CheckCircle2, pts: 200, earned: stats.resolved >= 5 },
            ].map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-10 rounded-[2.5rem] border-2 text-center relative overflow-hidden group transition-all duration-500 ${badge.earned ? "bg-card shadow-2xl border-primary/20" : "bg-muted/10 border-border/40 opacity-50 grayscale"
                  }`}
              >
                {badge.earned && (
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                )}
                <div className={`w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl transition-transform duration-700 group-hover:rotate-[360deg] ${badge.earned ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}>
                  <badge.icon className="w-10 h-10" />
                </div>
                <h3 className="font-black text-xl text-foreground mb-3 tracking-tight">{badge.name}</h3>
                <p className="text-sm font-medium text-muted-foreground mb-6 leading-relaxed px-4">{badge.desc}</p>
                <div className="flex items-center justify-center gap-2">
                  {badge.earned ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/40 px-4 py-1.5 rounded-full border border-border/40">
                      {badge.pts} PTS to Unlock
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
