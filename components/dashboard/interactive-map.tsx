"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, X, ThumbsUp, Navigation, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

type Problem = Database["public"]["Tables"]["problems"]["Row"]

const statusColors: Record<string, string> = {
  reported: "bg-accent",
  verified: "bg-blue-500",
  assigned: "bg-purple-500",
  in_progress: "bg-amber-500",
  resolved: "bg-green-500",
}

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])
  return null
}

export function InteractiveMap() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedMarker, setSelectedMarker] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProblems() {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

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

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-[2rem] border">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Default center (Bangalore as in the original code, or a dynamic one)
  const defaultCenter: [number, number] = [12.9716, 77.5946]

  return (
    <div className="relative h-[400px] rounded-[2rem] overflow-hidden border shadow-xl z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizer />

        {problems.map((problem) => (
          <Marker
            key={problem.id}
            position={[problem.lat, problem.lng]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => setSelectedMarker(problem),
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm mb-1">{problem.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 capitalize">{problem.category.replace('_', ' ')}</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors[problem.status]}`} />
                  <span className="text-[10px] font-bold uppercase">{problem.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Selected marker overlay */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border p-4 z-[1000]"
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
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md rounded-2xl p-4 border shadow-xl z-[1000]">
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
