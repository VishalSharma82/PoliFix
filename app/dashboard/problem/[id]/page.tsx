"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  MapPin,
  ThumbsUp,
  MessageCircle,
  Share2,
  Flag,
  Clock,
  User,
  ChevronLeft,
  Send,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Navigation,
  Heart,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import dynamic from "next/dynamic"

const ProblemMap = dynamic(
  () => import("@/components/dashboard/problem-map").then(m => m.ProblemMap),
  { ssr: false, loading: () => <div className="w-full h-48 bg-muted/20 animate-pulse rounded-none" /> }
)

type Problem = Database["public"]["Tables"]["problems"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Comment = Database["public"]["Tables"]["comments"]["Row"] & { profiles: Profile }

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  reported: { bg: "bg-accent/10", text: "text-accent", icon: AlertTriangle },
  verified: { bg: "bg-blue-500/10", text: "text-blue-600", icon: CheckCircle2 },
  assigned: { bg: "bg-purple-500/10", text: "text-purple-600", icon: User },
  in_progress: { bg: "bg-amber-500/10", text: "text-amber-600", icon: Clock },
  resolved: { bg: "bg-green-500/10", text: "text-green-600", icon: CheckCircle2 },
}

export default function ProblemDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [reporter, setReporter] = useState<Profile | null>(null)
  const [commentsList, setCommentsList] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [hasVerified, setHasVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    async function fetchProblemData() {
      setLoading(true)
      try {
        const { data: problemData, error: problemError } = await supabase
          .from('problems')
          .select('*')
          .eq('id', id as string)
          .single()

        if (problemError) throw problemError
        setProblem(problemData)

        // Fetch Reporter
        const { data: reporterData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', problemData.reporter_id)
          .single()
        setReporter(reporterData)

        // Fetch Comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*, profiles(*)')
          .eq('problem_id', id as string)
          .order('created_at', { ascending: true })

        setCommentsList(commentsData as any || [])

        // Check if user has already verified
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUser(user)
          const { data: verification } = await supabase
            .from('verifications')
            .select('*')
            .eq('problem_id', id as string)
            .eq('user_id', user.id)
            .single()
          if (verification) setHasVerified(true)
        }
      } catch (err: any) {
        setError(err.message || "Problem not found")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProblemData()
  }, [id])

  const handleMarkResolved = async () => {
    if (!problem) return
    try {
      const { error } = await supabase
        .from('problems')
        .update({ status: 'resolved' })
        .eq('id', id as string)
      
      if (error) throw error
      setProblem(p => p ? { ...p, status: 'resolved' } : null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: problem?.title || 'Reported Problem',
          text: `Check out this issue reported on Environment Friendly: ${problem?.title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this issue: ${window.location.href}`)}`, '_blank')
    }
  }

  const handleLocate = () => {
    if (problem?.lat && problem?.lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${problem.lat},${problem.lng}`, '_blank')
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      if (hasVerified) {
        // Unverify
        await supabase
          .from('verifications')
          .delete()
          .eq('problem_id', id as string)
          .eq('user_id', user.id)

        setProblem(p => p ? { ...p, confirmed_count: Math.max(0, p.confirmed_count - 1) } : null)
        setHasVerified(false)
      } else {
        // Verify
        await supabase
          .from('verifications')
          .insert({ problem_id: id as string, user_id: user.id })

        setProblem(p => p ? { ...p, confirmed_count: p.confirmed_count + 1 } : null)
        setHasVerified(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsVerifying(false)
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return
    setIsCommenting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .insert({
          problem_id: id as string,
          user_id: user.id,
          content: newComment
        })
        .select('*, profiles(*)')
        .single()

      if (commentError) throw commentError
      setCommentsList(prev => [...prev, comment as any])
      setNewComment("")
    } catch (err) {
      console.error(err)
    } finally {
      setIsCommenting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Fetching details...</p>
      </div>
    )
  }

  if (error || !problem) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight">Oops! Problem not found.</h1>
        <p className="text-muted-foreground mb-8">
          {error || "The report you're looking for doesn't exist or has been removed."}
        </p>
        <Button asChild size="lg" className="rounded-2xl font-bold">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const currentStatus = statusColors[problem.status] || statusColors.reported

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-all group"
      >
        <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header card */}
          <Card className="border-border/40 shadow-xl rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${currentStatus.bg} ${currentStatus.text} border border-current/20 shadow-sm`}>
                      {problem.status.replace("_", " ")}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${problem.severity === 'critical' ? 'bg-red-500 text-white' :
                      problem.severity === 'high' ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'
                      } shadow-md`}>
                      {problem.severity} magnitude
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-foreground tracking-tight leading-tight">{problem.title}</h1>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/50 hidden sm:flex">
                  <MoreHorizontal className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-sm text-muted-foreground mb-10 border-b border-border/20 pb-10">
                <span className="flex items-center gap-2 font-bold text-foreground/80 bg-muted/30 px-4 py-2 rounded-xl border border-border/20">
                  <MapPin className="w-4 h-4 text-primary" />
                  {problem.address || "Location unknown"}
                </span>
                <span className="flex items-center gap-2 font-bold">
                  <Clock className="w-4 h-4 text-primary" />
                  Reported {new Date(problem.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Images */}
              {problem.image_urls.length > 0 && (
                <div className="mb-10 lg:-mx-4">
                  <div
                    className="relative aspect-[16/9] sm:aspect-[21/9] rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl border border-border/20"
                    onClick={() => setShowImageModal(true)}
                  >
                    <img
                      src={problem.image_urls[activeImage]}
                      alt={problem.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  {problem.image_urls.length > 1 && (
                    <div className="flex gap-4 mt-6 overflow-x-auto pb-2 px-2 no-scrollbar">
                      {problem.image_urls.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImage(index)}
                          className={`w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all shrink-0 shadow-lg ${index === activeImage ? "border-primary scale-110" : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="prose prose-slate dark:prose-invert max-w-none mb-10">
                <p className="text-xl text-foreground/80 leading-relaxed font-medium">{problem.description}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-10 border-t border-border/20">
                <Button
                  size="lg"
                  variant={hasVerified ? "default" : "outline"}
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className={`h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${hasVerified ? "bg-primary shadow-xl shadow-primary/30" : "hover:bg-primary/5 border-primary/20"
                    }`}
                >
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <ThumbsUp className={`w-5 h-5 mr-3 ${hasVerified ? "fill-current" : ""}`} />
                  )}
                  {hasVerified ? "Confirmed" : "Confirm Issue"} ({problem.confirmed_count})
                </Button>

                {currentUser?.id === problem.reporter_id && problem.status !== 'resolved' && (
                  <Button 
                    size="lg" 
                    variant="default"
                    className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest bg-green-500 hover:bg-green-600 text-white shadow-xl shadow-green-500/30 transition-all border-none"
                    onClick={handleMarkResolved}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-3" />
                    Mark as Resolved
                  </Button>
                )}

                <Button variant="outline" size="lg" onClick={handleShare} className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-border/40 hover:bg-muted/50 transition-all">
                  <Share2 className="w-5 h-5 mr-3" />
                  Share Report
                </Button>
                <Button variant="outline" size="lg" onClick={handleLocate} className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-border/40 hover:bg-muted/50 transition-all">
                  <Navigation className="w-5 h-5 mr-3" />
                  Locate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments section */}
          <Card className="border-border/40 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                Community Discussion <span className="text-muted-foreground ml-2">({commentsList.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              {/* Add comment */}
              <div className="flex gap-6 p-6 bg-muted/30 rounded-[2rem] border border-border/20">
                <Avatar className="w-12 h-12 border-2 border-primary/20 shrink-0">
                  <AvatarFallback className="bg-primary text-white font-black uppercase">YOU</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Contribute to the resolution. Suggest fixes or provide updates..."
                    className="min-h-[100px] p-5 text-lg rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 resize-none"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      className="h-12 px-8 rounded-xl font-bold gap-3 shadow-lg shadow-primary/10"
                      disabled={!newComment.trim() || isCommenting}
                      onClick={handlePostComment}
                    >
                      {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Post Update
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-8 pt-4">
                {commentsList.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-6 group"
                  >
                    <Avatar className="w-12 h-12 border-2 border-primary/10 group-hover:border-primary transition-colors shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                        {comment.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-background/30 p-6 rounded-[2rem] border border-border/20 group-hover:bg-background/60 transition-all group-hover:shadow-lg group-hover:shadow-primary/5">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="font-black text-foreground tracking-tight">{comment.profiles?.full_name || 'Anonymous citizen'}</span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground/80 leading-relaxed font-medium">{comment.content}</p>
                      <button className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        <Heart className="w-4 h-4" />
                        Helpful update
                      </button>
                    </div>
                  </motion.div>
                ))}
                {commentsList.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-border/20 rounded-[2rem]">
                    <p className="font-black text-muted-foreground uppercase tracking-widest opacity-50">No updates posted yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Reporter info */}
          <Card className="border-border/40 shadow-xl rounded-[2.5rem] bg-primary text-primary-foreground overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Report Authenticated By</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-white/20 shadow-xl">
                  <AvatarFallback className="bg-white text-primary font-black text-2xl">
                    {reporter?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-black text-2xl tracking-tighter leading-tight">{reporter?.full_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Level {Math.floor((reporter?.reputation_points || 0) / 100) + 1}
                    </span>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Citizen Reporter</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress timeline */}
          <Card className="border-border/40 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resolution Pulse</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-10">
              <div className="space-y-6 relative ml-4 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted/50">
                <div className="flex gap-6 items-start relative">
                  <div className="w-6 h-6 rounded-full bg-primary border-4 border-background shadow-lg z-10 shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-black text-foreground tracking-tight">Report Logged</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      {new Date(problem.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {problem.status !== 'reported' && (
                  <div className="flex gap-6 items-start relative opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-background shadow-lg z-10 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-black text-foreground tracking-tight">Community Verified</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Pending Confirmation</p>
                    </div>
                  </div>
                )}

                {problem.status === 'resolved' && (
                  <div className="flex gap-6 items-start relative bg-success/10 p-4 -ml-4 rounded-2xl border border-success/20">
                    <div className="w-6 h-6 rounded-full bg-success border-4 border-background shadow-lg z-10 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-black text-success tracking-tight">Issue Resolved</p>
                      <p className="text-[10px] font-bold text-success/70 uppercase tracking-widest mt-1">Reputation Awarded</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-border/20">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <span className="text-muted-foreground">Confidence Metric</span>
                  <span className="text-primary">{Math.min(100, problem.confirmed_count * 5)}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted/50 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, problem.confirmed_count * 5)}%` }}
                    className="h-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.3)]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location context */}
          <Card className="border-border/40 shadow-xl rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Geospatial Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-52 relative overflow-hidden z-0">
                <ProblemMap lat={problem.lat} lng={problem.lng} title={problem.title} />
                {/* Radius label overlay */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-border/40 shadow-xl z-[1000] pointer-events-none">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">⬤ Radius: 500m</p>
                </div>
              </div>
              {/* Coordinates & address */}
              <div className="px-6 pt-4 pb-2 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Coordinates</p>
                <p className="text-xs font-mono font-bold text-foreground/80">
                  {problem.lat.toFixed(5)}, {problem.lng.toFixed(5)}
                </p>
                {problem.address && (
                  <p className="text-xs text-muted-foreground truncate">{problem.address}</p>
                )}
              </div>
              <div className="p-4 bg-muted/30 flex gap-3">
                <Button
                  variant="default"
                  onClick={handleLocate}
                  className="flex-1 h-11 rounded-xl font-bold shadow-lg shadow-primary/10 gap-2 text-xs"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Google Maps
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`${problem.lat}, ${problem.lng}`)
                  }}
                  className="h-11 px-4 rounded-xl font-bold text-xs border-border/40"
                  title="Copy coordinates"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 sm:p-12 backdrop-blur-lg"
            onClick={() => setShowImageModal(false)}
          >
            <button
              className="absolute top-8 right-8 p-3 text-white hover:bg-white/10 rounded-2xl transition-all hover:rotate-90"
              onClick={() => setShowImageModal(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={problem.image_urls[activeImage]}
              alt={problem.title}
              className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
