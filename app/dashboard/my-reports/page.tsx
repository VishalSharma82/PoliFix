"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MapPin,
  ThumbsUp,
  Clock,
  Eye,
  Loader2,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  AlertCircle,
  PlusCircle,
  FolderOpen
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type Problem = Database["public"]["Tables"]["problems"]["Row"]

const statusColors: Record<string, string> = {
  reported: "bg-accent/10 text-accent",
  verified: "bg-blue-500/10 text-blue-600",
  assigned: "bg-purple-500/10 text-purple-600",
  in_progress: "bg-amber-500/10 text-amber-600",
  resolved: "bg-green-500/10 text-green-600",
}

export default function MyReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMyReports() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setReports(data as Problem[])
      setLoading(false)
    }

    fetchMyReports()
  }, [router])

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return
    
    setIsDeleting(reportId)
    try {
      const response = await fetch(`http://localhost:5000/api/v1/problems/${reportId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete report")
      }
      
      setReports(prev => prev.filter(r => r.id !== reportId))
    } catch (err: any) {
      console.error(err)
      alert(`Error: ${err.message}`)
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Accessing archives...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <FolderOpen className="w-7 h-7 text-emerald-600" />
             </div>
             My Impact Reports
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage and monitor the status of your reported civic issues.</p>
        </div>
        <Button size="lg" className="rounded-2xl font-bold shadow-xl shadow-primary/20 h-14 px-8 gap-3" asChild>
           <Link href="/dashboard/report">
             <PlusCircle className="w-5 h-5" />
             File New Report
           </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search your reports by title, description or location..." 
            className="pl-12 h-14 rounded-2xl bg-card border-border/40 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="h-14 rounded-2xl px-6 gap-2 border-border/40 font-bold flex-1 sm:flex-initial">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl px-6 gap-2 border-border/40 font-bold flex-1 sm:flex-initial">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/dashboard/problem/${report.id}`}
                className="group flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[2.5rem] bg-card/50 backdrop-blur-sm border border-border/40 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  report.status === 'resolved' ? 'bg-green-500' : 
                  report.status === 'reported' ? 'bg-accent' : 'bg-primary'
                }`} />

                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors overflow-hidden">
                  {report.image_urls?.[0] ? (
                    <img src={report.image_urls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <MapPin className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-black text-xl text-foreground group-hover:text-primary transition-all truncate leading-tight mb-1">
                        {report.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                            <MapPin className="w-3.5 h-3.5 text-primary/60" />
                            <span className="truncate">{report.address || "Location detail unavailable"}</span>
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm self-start sm:self-center ${statusColors[report.status]}`}>
                      {report.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-border/10">
                    <span className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <ThumbsUp className="w-4 h-4 text-primary/60" />
                      {report.confirmed_count} Citizen Confirmations
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Clock className="w-4 h-4 text-primary/60" />
                      Logged {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-border/10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-2xl text-destructive hover:bg-destructive/10 transition-all shrink-0 active:scale-90"
                    onClick={(e) => handleDeleteReport(report.id, e)}
                    disabled={isDeleting === report.id}
                  >
                    {isDeleting === report.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </Button>
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredReports.length === 0 && !loading && (
          <div className="py-24 text-center border-4 border-dashed border-border/20 rounded-[3rem] bg-card/20 pb-32">
             <div className="w-24 h-24 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-8">
               <AlertCircle className="w-12 h-12 text-muted-foreground opacity-30" />
             </div>
             <h3 className="text-2xl font-black text-foreground mb-3 underline decoration-primary/30 decoration-4 underline-offset-8">No matching reports found</h3>
             <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs mb-10 max-w-sm mx-auto leading-relaxed">
               {searchQuery ? "Try adjusting your search terms or filters to find what you're looking for." : "You haven't filed any reports yet. Your contributions make the city better!"}
             </p>
             {!searchQuery && (
               <Button size="lg" className="rounded-2xl font-bold shadow-xl shadow-primary/20 h-16 px-10 gap-3" asChild>
                 <Link href="/dashboard/report">
                   <PlusCircle className="w-6 h-6" />
                   File Your First Report
                 </Link>
               </Button>
             )}
          </div>
        )}
      </div>
    </div>
  )
}
