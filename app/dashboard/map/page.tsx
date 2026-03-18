"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Search,
  Filter,
  Plus,
  Minus,
  Navigation,
  X,
  ThumbsUp,
  MessageCircle,
  ChevronRight,
  Loader2,
  List,
  Radar,
  Zap,
  Brain,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import dynamic from "next/dynamic"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { haversineDistanceKm, computePriorityScore, getPriorityLevel } from "@/lib/priority"

const InteractiveMap = dynamic(() => import("@/components/dashboard/interactive-map").then(mod => mod.InteractiveMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse flex items-center justify-center rounded-[3rem]">Loading Map...</div>
})

type Problem = Database["public"]["Tables"]["problems"]["Row"] & {
  ai_priority_score?: number
  location_importance?: number
  location_importance_reason?: string
}

const statusColors: Record<string, string> = {
  reported: "bg-accent",
  verified: "bg-blue-500",
  assigned: "bg-purple-500",
  in_progress: "bg-amber-500",
  resolved: "bg-green-500",
}

export default function MapPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([])
  const [selectedMarker, setSelectedMarker] = useState<Problem | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showList, setShowList] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [nearbyOnly, setNearbyOnly] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [aiPriorityActive, setAiPriorityActive] = useState(true)
  const [predictions, setPredictions] = useState<any[]>([])
  const [showPredictions, setShowPredictions] = useState(false)

  useEffect(() => {
    async function fetchMapData() {
      setLoading(true)
      try {
        const [prioRes, predRes] = await Promise.all([
          fetch('http://localhost:5000/api/v1/problems/prioritized'),
          fetch('http://localhost:5000/api/v1/ai/predict')
        ])
        
        const { data: prioData } = await prioRes.json()
        const { data: predData } = await predRes.json()
        
        if (prioData) {
          setProblems(prioData)
          setFilteredProblems(prioData)
        } else {
          const { data: sbData } = await supabase.from('problems').select('*')
          if (sbData) {
            setProblems(sbData)
            setFilteredProblems(sbData)
          }
        }

        if (predData) {
          setPredictions(predData)
        }
      } catch (err) {
        console.error("Failed to fetch AI data:", err)
        const { data: sbData } = await supabase.from('problems').select('*')
        if (sbData) {
          setProblems(sbData)
          setFilteredProblems(sbData)
        }
      }
      setLoading(false)
    }
    fetchMapData()
  }, [])

  useEffect(() => {
    let result = problems

    if (searchQuery) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category))
    }

    if (selectedStatuses.length > 0) {
      result = result.filter(p => selectedStatuses.includes(p.status))
    }

    if (nearbyOnly && userLocation) {
      result = result.filter(p => {
        const dist = haversineDistanceKm(userLocation[0], userLocation[1], p.lat, p.lng)
        return dist <= 2
      })
    }

    if (aiPriorityActive) {
      result = [...result].sort((a, b) => {
        const scoreA = a.ai_priority_score ?? computePriorityScore(a)
        const scoreB = b.ai_priority_score ?? computePriorityScore(b)
        return scoreB - scoreA
      })
    }

    setFilteredProblems(result)
  }, [searchQuery, selectedCategories, selectedStatuses, problems, nearbyOnly, userLocation, aiPriorityActive])

  function handleLocate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setNearbyOnly(true)
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const categories = [...new Set(problems.map(p => p.category))].map(cat => ({
    id: cat,
    label: cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: problems.filter(p => p.category === cat).length
  }))

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Mapping infrastructure...</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 max-w-[1600px] mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Geospatial Explorer</h1>
          <p className="text-muted-foreground font-medium">Visualizing {filteredProblems.length} community impact points. {nearbyOnly && userLocation && <span className="text-primary font-black">📍 Showing within 2km</span>}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search reports or areas..."
              className="pl-12 h-14 rounded-2xl border-border/40 bg-card/50 backdrop-blur-md shadow-xl focus:ring-primary/20 relative z-10 font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={nearbyOnly ? "default" : "outline"}
            className={`h-14 px-5 rounded-2xl border-border/40 transition-all gap-2 font-bold text-xs ${nearbyOnly ? "shadow-xl shadow-primary/20" : ""}`}
            onClick={() => nearbyOnly ? setNearbyOnly(false) : handleLocate()}
            disabled={locating}
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
            {nearbyOnly ? "2km ON" : "Nearby"}
          </Button>
          <Button
            variant={showFilters ? "default" : "outline"}
            className={`h-14 w-14 rounded-2xl border-border/40 transition-all ${showFilters ? "shadow-xl shadow-primary/20" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            variant={showList ? "default" : "outline"}
            className={`h-14 w-14 rounded-2xl border-border/40 transition-all ${showList ? "shadow-xl shadow-primary/20" : ""}`}
            onClick={() => setShowList(!showList)}
          >
            <List className="w-5 h-5" />
          </Button>
          <Button
            variant={aiPriorityActive ? "default" : "outline"}
            className={`h-14 px-5 rounded-2xl border-border/40 transition-all gap-2 font-bold text-xs ${aiPriorityActive ? "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 text-white border-transparent" : ""}`}
            onClick={() => setAiPriorityActive(!aiPriorityActive)}
          >
            <Sparkles className={`w-4 h-4 ${aiPriorityActive ? "animate-pulse" : ""}`} />
            {aiPriorityActive ? "AI RANKING ON" : "AI Ranking"}
          </Button>
          <Button
            variant={showPredictions ? "default" : "outline"}
            className={`h-14 px-5 rounded-2xl border-border/40 transition-all gap-2 font-bold text-xs ${showPredictions ? "bg-pink-600 hover:bg-pink-700 shadow-xl shadow-pink-500/20 text-white border-transparent" : ""}`}
            onClick={() => setShowPredictions(!showPredictions)}
          >
            <TrendingUp className={`w-4 h-4 ${showPredictions ? "animate-bounce" : ""}`} />
            {showPredictions ? "AI PREDICTION ON" : "Future Risks"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 relative overflow-hidden pb-4">
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              className="absolute left-0 top-0 z-30 w-80 h-full"
            >
              <Card className="h-full border-border/40 shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-8 space-y-8 overflow-y-auto h-full no-scrollbar">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-xl tracking-tight">Filters</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="rounded-xl">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Categories</p>
                      <div className="grid gap-2">
                        {categories.map(cat => (
                          <div key={cat.id} className="flex items-center justify-between p-3 rounded-2xl bg-background/40 border border-border/20 hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                id={cat.id} 
                                checked={selectedCategories.includes(cat.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) setSelectedCategories([...selectedCategories, cat.id])
                                  else setSelectedCategories(selectedCategories.filter(id => id !== cat.id))
                                }}
                              />
                              <label htmlFor={cat.id} className="text-sm font-bold cursor-pointer">{cat.label}</label>
                            </div>
                            <Badge variant="secondary" className="rounded-lg">{cat.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Status</p>
                      <div className="grid gap-2">
                        {Object.keys(statusColors).map(status => (
                          <div key={status} className="flex items-center gap-3 p-3 rounded-2xl bg-background/40 border border-border/20">
                            <Checkbox 
                              id={status}
                              checked={selectedStatuses.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedStatuses([...selectedStatuses, status])
                                else setSelectedStatuses(selectedStatuses.filter(s => s !== status))
                              }}
                            />
                            <label htmlFor={status} className="text-sm font-bold cursor-pointer capitalize">{status.replace('_', ' ')}</label>
                            <span className={`w-2 h-2 rounded-full ml-auto ${statusColors[status]}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 relative rounded-[3rem] overflow-hidden border border-border/40 bg-card/10 shadow-2xl transition-all duration-700">
          <InteractiveMap
            problems={filteredProblems}
            predictions={predictions}
            showPredictions={showPredictions}
            height="100%"
            zoom={zoom + 12}
            center={[12.9716, 77.5946]}
            onMarkerClick={(p) => setSelectedMarker(p)}
          />

          <div className="absolute bottom-8 left-8 z-[1000] flex flex-col gap-2">
            <Button 
              className="h-12 w-12 rounded-2xl bg-background/80 backdrop-blur-md border-border/40 text-foreground shadow-2xl hover:bg-background" 
              onClick={() => setZoom(Math.min(zoom + 1, 6))}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button 
              className="h-12 w-12 rounded-2xl bg-background/80 backdrop-blur-md border-border/40 text-foreground shadow-2xl hover:bg-background" 
              onClick={() => setZoom(Math.max(zoom - 1, 1))}
            >
              <Minus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showList && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              className="w-96 h-full flex flex-col gap-6"
            >
              <Card className="flex-1 border-border/40 shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-xl overflow-hidden flex flex-col">
                <CardContent className="p-8 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl tracking-tight">Active Reports</h3>
                    <Badge variant="secondary" className="rounded-lg h-6">{filteredProblems.length}</Badge>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                    {filteredProblems.map((problem) => (
                      <div 
                        key={problem.id}
                        onClick={() => setSelectedMarker(problem)}
                        className={`p-4 rounded-3xl border transition-all cursor-pointer group ${
                          selectedMarker?.id === problem.id 
                            ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" 
                            : "bg-background/40 border-border/20 hover:border-primary/40 hover:bg-background/60"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-lg ${statusColors[problem.status]}`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{problem.title}</h4>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">{problem.address || "Area unknown"}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white ${statusColors[problem.status]}`}>
                                {problem.status.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" /> {problem.confirmed_count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
