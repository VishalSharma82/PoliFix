"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, X, ThumbsUp, MessageCircle, Navigation, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type Problem = Database["public"]["Tables"]["problems"]["Row"]

const statusColors: Record<string, string> = {
  reported: "bg-accent",
  verified: "bg-blue-500",
  assigned: "bg-purple-500",
  in_progress: "bg-amber-500",
  resolved: "bg-green-500",
}

export function InteractiveMap() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedMarker, setSelectedMarker] = useState<Problem | null>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProblems() {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) setProblems(data)
      setLoading(false)
    }

    fetchProblems()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'problems' }, (payload) => {
        fetchProblems()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Simple coordinate to percentage mapping for the simulated map
  // This is a placeholder until a real map like Leaflet is integrated
  const getPosition = (lat: number, lng: number) => {
    // Relative to a specific area/city center
    const baseLat = 12.9716
    const baseLng = 77.5946
    const scale = 500 // Adjust based on how wide the "simulated area" is

    return {
      x: 50 + (lng - baseLng) * scale,
      y: 50 - (lat - baseLat) * scale,
    }
  }

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative h-80 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Simulated roads */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 160 Q 200 140, 400 160 T 800 150" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted-foreground/30" />
        <path d="M 200 0 Q 180 160, 200 320" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted-foreground/30" />
        <path d="M 400 0 Q 420 160, 400 320" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted-foreground/30" />
      </svg>

      {/* Markers */}
      {problems.map((marker) => {
        const { x, y } = getPosition(marker.lat, marker.lng)
        return (
          <motion.button
            key={marker.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredMarker(marker.id)}
            onHoverEnd={() => setHoveredMarker(null)}
            onClick={() => setSelectedMarker(marker)}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full ${statusColors[marker.status] || "bg-primary"} flex items-center justify-center shadow-lg border-2 border-white`}>
                <MapPin className="w-4 h-4 text-white" />
              </div>
              {marker.status === "reported" && (
                <motion.div
                  className={`absolute inset-0 rounded-full ${statusColors[marker.status]}`}
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredMarker === marker.id && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap shadow-lg z-50 font-bold"
                >
                  {marker.title}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}

      {/* Selected marker popup */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border p-4 z-20"
          >
            <button
              onClick={() => setSelectedMarker(null)}
              className="absolute top-3 right-3 p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl ${statusColors[selectedMarker.status]} flex items-center justify-center shrink-0 shadow-lg`}>
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground truncate ">{selectedMarker.title}</h3>
                <p className="text-sm text-muted-foreground capitalize">{selectedMarker.category.replace('_', ' ')}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-black text-muted-foreground uppercase tracking-widest ">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {selectedMarker.confirmed_count} verified
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedMarker.status === "reported" ? "bg-accent/10 text-accent border border-accent/20" :
                    selectedMarker.status === "resolved" ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                      "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}>
                    {selectedMarker.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" className="flex-1 rounded-xl font-bold" asChild>
                <a href={`/dashboard/problem/${selectedMarker.id}`}>View Details</a>
              </Button>
              <Button size="sm" variant="outline" className="rounded-xl">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md rounded-2xl p-4 border shadow-xl">
        <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-3">Live Status</p>
        <div className="space-y-2">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`} />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
