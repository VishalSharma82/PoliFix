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

type Problem = Database["public"]["Tables"]["problems"]["Row"]

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

  useEffect(() => {
    async function fetchMapData() {
      setLoading(true)
      const { data } = await supabase
        .from('problems')
        .select('*')

      if (data) {
        setProblems(data)
        setFilteredProblems(data)
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

    // Nearby 2km filter
    if (nearbyOnly && userLocation) {
      result = result.filter(p => {
        const dist = haversineDistanceKm(userLocation[0], userLocation[1], p.lat, p.lng)
        return dist <= 2
      })
    }

    // Sort by AI priority score
    result = [...result].sort((a, b) => computePriorityScore(b) - computePriorityScore(a))

    setFilteredProblems(result)
  }, [searchQuery, selectedCategories, selectedStatuses, problems, nearbyOnly, userLocation])

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

  const getPosition = (lat: number, lng: number) => {
    const baseLat = 12.9716
    const baseLng = 77.5946
    const scale = 500
    return {
      x: 50 + (lng - baseLng) * scale,
      y: 50 - (lat - baseLat) * scale,
    }
  }

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
      {/* Header */}
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
          {/* Nearby filter button */}
          <Button
            variant={nearbyOnly ? "default" : "outline"}
            className={`h-14 px-5 rounded-2xl border-border/40 transition-all gap-2 font-bold text-xs ${nearbyOnly ? "shadow-xl shadow-primary/20" : ""}`}
            onClick={() => {
              if (nearbyOnly) {
                setNearbyOnly(false)
              } else {
                handleLocate()
              }
            }}
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
        </div>
      </div>

      <div className="flex-1 flex gap-6 relative overflow-hidden pb-4">
        {/* Filters panel */}
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

                  <div className="space-y-10">
                    <div>
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Impact Categories</h4>
                      <div className="space-y-4">
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center gap-4 cursor-pointer group">
                            <Checkbox
                              checked={selectedCategories.includes(category.id)}
                              className="rounded-lg border-2 border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCategories([...selectedCategories, category.id])
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category.id))
                                }
                              }}
                            />
                            <span className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors flex-1">{category.label}</span>
                            <Badge variant="secondary" className="rounded-lg font-black text-[10px] opacity-60">{category.count}</Badge>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Resolution Status</h4>
                      <div className="space-y-4">
                        {Object.entries(statusColors).map(([status, color]) => (
                          <label key={status} className="flex items-center gap-4 cursor-pointer group">
                            <Checkbox
                              checked={selectedStatuses.includes(status)}
                              className="rounded-lg border-2 border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedStatuses([...selectedStatuses, status])
                                } else {
                                  setSelectedStatuses(selectedStatuses.filter(s => s !== status))
                                }
                              }}
                            />
                            <span className={`w-3 h-3 rounded-full ${color} shadow-sm group-hover:scale-125 transition-transform`} />
                            <span className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors capitalize">{status.replace("_", " ")}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-border/40 hover:bg-muted/40" onClick={() => {
                      setSelectedCategories([])
                      setSelectedStatuses([])
                    }}>
                      Reset Mapping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map */}
        <div className="flex-1 relative rounded-[3rem] overflow-hidden border border-border/40 bg-card/10 shadow-2xl transition-all duration-700">
          <InteractiveMap 
            problems={filteredProblems} 
            height="100%" 
            zoom={zoom + 12} 
            center={[12.9716, 77.5946]}
            onMarkerClick={(marker: Problem) => setSelectedMarker(marker)}
          />

          {/* Zoom controls */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-[1000]">
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
            <Button className="h-12 w-12 rounded-2xl bg-primary text-white shadow-2xl shadow-primary/40">
              <Navigation className="w-5 h-5" />
            </Button>
          </div>

          {/* Selected marker overlay */}
          <AnimatePresence>
            {selectedMarker && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="absolute bottom-8 left-8 right-8 sm:left-8 sm:right-auto sm:w-[400px] bg-background/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 p-8 z-[2000]"
              >
                <button
                  onClick={() => setSelectedMarker(null)}
                  className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-muted/50 rounded-xl transition-all hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex gap-6">
                  <div className={`w-16 h-16 rounded-2xl ${statusColors[selectedMarker.status]} flex items-center justify-center shrink-0 shadow-xl border-4 border-white/10`}>
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[selectedMarker.status]} text-white shadow-sm`}>
                        {selectedMarker.status.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-foreground tracking-tight line-clamp-2 leading-tight">{selectedMarker.title}</h3>
                    <p className="text-sm font-bold text-muted-foreground mt-2 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {selectedMarker.address}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pb-8 border-b border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ThumbsUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">{selectedMarker.confirmed_count}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Verified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">2</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Comments</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button size="lg" className="flex-1 rounded-2xl font-black text-xs uppercase tracking-widest h-14 shadow-xl shadow-primary/20" asChild>
                    <Link href={`/dashboard/problem/${selectedMarker.id}`}>View Analysis</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-2xl h-14 px-6 border-border/40">
                    <Navigation className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* List panel */}
        <AnimatePresence>
          {showList && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              className="w-96 shrink-0 hidden lg:block h-full"
            >
              <Card className="h-full border-border/40 shadow-2xl rounded-[3rem] bg-card/50 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="p-8 border-b border-border/20 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-xl tracking-tight">Index</h3>
                      <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">{filteredProblems.length} points located</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowList(false)} className="rounded-xl">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                    {filteredProblems.map((marker) => (
                      <button
                        key={marker.id}
                        onClick={() => setSelectedMarker(marker)}
                        className={`w-full p-6 text-left rounded-[2rem] border transition-all duration-300 group ${selectedMarker?.id === marker.id
                            ? "bg-primary border-primary shadow-xl shadow-primary/20"
                            : "bg-background/40 border-border/20 hover:bg-background/80 hover:shadow-lg"
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:rotate-12 ${selectedMarker?.id === marker.id ? "bg-white/20" : statusColors[marker.status]
                            }`}>
                            <MapPin className={`w-6 h-6 ${selectedMarker?.id === marker.id ? "text-white" : "text-white"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-black text-base tracking-tight leading-tight mb-1 truncate ${selectedMarker?.id === marker.id ? "text-white" : "text-foreground"
                              }`}>{marker.title}</h4>
                            <p className={`text-xs font-bold uppercase tracking-widest truncate ${selectedMarker?.id === marker.id ? "text-white/70" : "text-muted-foreground"
                              }`}>{marker.address}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${selectedMarker?.id === marker.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                }`}>24h active</span>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 shrink-0 self-center transition-transform group-hover:translate-x-1 ${selectedMarker?.id === marker.id ? "text-white" : "text-muted-foreground"
                            }`} />
                        </div>
                      </button>
                    ))}
                    {filteredProblems.length === 0 && (
                      <div className="py-20 text-center border-4 border-dashed border-border/20 rounded-[2.5rem] opacity-50 m-4">
                        <p className="font-black text-muted-foreground uppercase text-xs tracking-widest">No matching results.</p>
                      </div>
                    )}
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
