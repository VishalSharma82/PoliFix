"use client"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, X, ThumbsUp, Navigation, Loader2, Flame, MapPinned, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { computePriorityScore } from "@/lib/priority"

// ─── Tile Layer Definitions ───────────────────────────────────────────────────
const TILE_LAYERS = {
  street: {
    label: "Street",
    emoji: "🗺️",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    label: "Satellite",
    emoji: "🛰️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  dark: {
    label: "Dark",
    emoji: "🌙",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  terrain: {
    label: "Terrain",
    emoji: "🏔️",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  transport: {
    label: "Transit",
    emoji: "🚌",
    url: "https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png",
    attribution: 'Map <a href="https://memomaps.de/">memomaps.de</a> <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
} as const

type TileLayerKey = keyof typeof TILE_LAYERS

// ─── Marker Icons ─────────────────────────────────────────────────────────────
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function createPriorityIcon(color: string, glowColor: string) {
  return L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
    html: `
      <div style="
        width:30px;height:30px;border-radius:50% 50% 50% 0;
        background:${color};border:3px solid rgba(255,255,255,0.9);
        box-shadow:0 2px 12px ${glowColor},0 0 0 4px ${glowColor};
        transform:rotate(-45deg);
        transition:transform 0.2s;
      "></div>
    `,
  })
}

const PRIORITY_ICONS = {
  CRITICAL: createPriorityIcon('#ef4444', 'rgba(239,68,68,0.35)'),
  HIGH:     createPriorityIcon('#f97316', 'rgba(249,115,22,0.30)'),
  MEDIUM:   createPriorityIcon('#eab308', 'rgba(234,179,8,0.30)'),
  LOW:      createPriorityIcon('#22c55e', 'rgba(34,197,94,0.25)'),
}

type Problem = Database["public"]["Tables"]["problems"]["Row"]

const statusColors: Record<string, string> = {
  reported: "bg-orange-500",
  verified: "bg-blue-500",
  assigned: "bg-purple-500",
  in_progress: "bg-amber-500",
  resolved: "bg-green-500",
}

// ─── Internal Components ──────────────────────────────────────────────────────
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => { map.invalidateSize() }, 100)
  }, [map])
  return null
}

interface HeatmapLayerProps {
  problems: Problem[]
  visible: boolean
}

function HeatmapLayer({ problems, visible }: HeatmapLayerProps) {
  const map = useMap()
  const heatLayerRef = useRef<any>(null)

  useEffect(() => {
    if (!visible) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
        heatLayerRef.current = null
      }
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('leaflet.heat')

      const points = problems
        .filter(p => p.status !== 'resolved')
        .map(p => {
          const score = computePriorityScore(p)
          const normalised = Math.min(1, score / 80)
          return [p.lat, p.lng, normalised] as [number, number, number]
        })

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
      }

      if (points.length === 0) return

      // @ts-ignore — leaflet.heat patches L at runtime
      heatLayerRef.current = (L as any).heatLayer(points, {
        radius: 35,
        blur: 25,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: '#1a237e',
          0.2: '#00bcd4',
          0.4: '#4caf50',
          0.6: '#ffeb3b',
          0.8: '#ff9800',
          1.0: '#f44336',
        },
      }).addTo(map)
    } catch (e) {
      console.warn('leaflet.heat could not be loaded', e)
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
        heatLayerRef.current = null
      }
    }
  }, [map, problems, visible])

  return null
}

// ─── Scale bar ────────────────────────────────────────────────────────────────
function ScaleControl() {
  const map = useMap()
  useEffect(() => {
    const scale = L.control.scale({ position: 'bottomleft', metric: true, imperial: false })
    scale.addTo(map)
    return () => { scale.remove() }
  }, [map])
  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface InteractiveMapProps {
  problems?: Problem[]
  height?: string
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (problem: Problem) => void
  showHeatmap?: boolean
}

export function InteractiveMap({
  problems: propsProblems,
  height = "400px",
  center,
  zoom = 13,
  onMarkerClick,
  showHeatmap: externalShowHeatmap,
}: InteractiveMapProps) {
  const [internalProblems, setInternalProblems] = useState<Problem[]>([])
  const [selectedMarker, setSelectedMarker] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(!propsProblems)
  const [heatmapMode, setHeatmapMode] = useState(externalShowHeatmap ?? false)
  const [activeLayer, setActiveLayer] = useState<TileLayerKey>('street')
  const [showLayerSwitcher, setShowLayerSwitcher] = useState(false)

  const displayProblems = propsProblems || internalProblems

  useEffect(() => {
    if (externalShowHeatmap !== undefined) setHeatmapMode(externalShowHeatmap)
  }, [externalShowHeatmap])

  useEffect(() => {
    if (propsProblems) { setLoading(false); return }

    async function fetchProblems() {
      const { data } = await supabase
        .from('problems').select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (data) setInternalProblems(data)
      setLoading(false)
    }

    fetchProblems()

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'problems' }, () => {
        fetchProblems()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [propsProblems])

  if (loading) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-muted/20 rounded-[2rem] border">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const defaultCenter: [number, number] = center || [12.9716, 77.5946]
  const currentTile = TILE_LAYERS[activeLayer]

  function getIcon(problem: Problem): L.Icon | L.DivIcon {
    const score = computePriorityScore(problem)
    if (score >= 50) return PRIORITY_ICONS.CRITICAL
    if (score >= 30) return PRIORITY_ICONS.HIGH
    if (score >= 15) return PRIORITY_ICONS.MEDIUM
    return PRIORITY_ICONS.LOW
  }

  return (
    <div style={{ height }} className="relative rounded-[2rem] overflow-hidden border shadow-xl z-0">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        {/* ── Active tile layer ── */}
        <TileLayer
          key={activeLayer}
          attribution={currentTile.attribution}
          url={currentTile.url}
          maxZoom={activeLayer === 'terrain' ? 17 : 19}
        />
        <MapResizer />
        <ScaleControl />

        {/* ── Heatmap ── */}
        <HeatmapLayer problems={displayProblems} visible={heatmapMode} />

        {/* ── Priority markers (marker mode only) ── */}
        {!heatmapMode && displayProblems.map((problem) => (
          <Marker
            key={problem.id}
            position={[problem.lat, problem.lng]}
            icon={getIcon(problem)}
            eventHandlers={{
              click: () => {
                setSelectedMarker(problem)
                onMarkerClick?.(problem)
              },
            }}
          >
            <Popup className="rounded-2xl overflow-hidden">
              <div className="p-2 min-w-[160px]">
                <h3 className="font-bold text-sm mb-1 leading-tight">{problem.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 capitalize">{problem.category.replace('_', ' ')}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusColors[problem.status]}`} />
                    <span className="text-[10px] font-bold uppercase">{problem.status.replace('_', ' ')}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">✓ {problem.confirmed_count}</span>
                </div>
                <a
                  href={`/dashboard/problem/${problem.id}`}
                  className="mt-2 w-full flex items-center justify-center px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-wider"
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ───── TOP LEFT: Map type + Heatmap toggle ───────────────────────── */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2 flex-wrap">
        {/* Markers / Heatmap toggle */}
        <div className="flex gap-1.5 bg-background/80 backdrop-blur-md rounded-2xl p-1.5 border border-border/40 shadow-lg">
          <button
            onClick={() => setHeatmapMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              !heatmapMode
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapPinned className="w-3.5 h-3.5" />
            Markers
          </button>
          <button
            onClick={() => setHeatmapMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              heatmapMode
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Heatmap
          </button>
        </div>

        {/* Layer switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLayerSwitcher(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border shadow-lg transition-all bg-background/80 backdrop-blur-md ${
              showLayerSwitcher
                ? 'border-primary/50 text-primary'
                : 'border-border/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {TILE_LAYERS[activeLayer].emoji} {TILE_LAYERS[activeLayer].label}
          </button>

          <AnimatePresence>
            {showLayerSwitcher && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute top-full mt-2 left-0 z-[2000] bg-background/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl overflow-hidden min-w-[160px]"
              >
                <div className="p-1.5 space-y-0.5">
                  {(Object.keys(TILE_LAYERS) as TileLayerKey[]).map(key => {
                    const layer = TILE_LAYERS[key]
                    return (
                      <button
                        key={key}
                        onClick={() => { setActiveLayer(key); setShowLayerSwitcher(false) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all text-left ${
                          activeLayer === key
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                      >
                        <span className="text-base leading-none">{layer.emoji}</span>
                        {layer.label}
                        {activeLayer === key && (
                          <span className="ml-auto text-[9px] font-black uppercase tracking-widest opacity-70">Active</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ───── TOP RIGHT: Legend ─────────────────────────────────────────── */}
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md rounded-2xl p-3.5 border border-border/40 shadow-xl z-[1000]">
        {heatmapMode ? (
          <>
            <p className="text-[9px] font-black text-foreground uppercase tracking-widest mb-2.5">Heat Intensity</p>
            <div className="space-y-1.5">
              {[
                { label: 'Critical Zones', c: 'bg-red-500' },
                { label: 'High Density',   c: 'bg-orange-400' },
                { label: 'Medium',         c: 'bg-yellow-400' },
                { label: 'Low Activity',   c: 'bg-green-400' },
                { label: 'Minimal',        c: 'bg-cyan-400' },
              ].map(({ label, c }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${c} shadow-sm flex-shrink-0`} />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-muted-foreground mt-2 font-bold">Resolved issues hidden</p>
          </>
        ) : (
          <>
            <p className="text-[9px] font-black text-foreground uppercase tracking-widest mb-2.5">AI Priority</p>
            <div className="space-y-1.5">
              {[
                { label: 'Critical', c: 'bg-red-500' },
                { label: 'High',     c: 'bg-orange-500' },
                { label: 'Medium',   c: 'bg-yellow-500' },
                { label: 'Low',      c: 'bg-green-500' },
              ].map(({ label, c }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${c} shadow-sm flex-shrink-0`} />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/20">
              <p className="text-[9px] font-black text-foreground uppercase tracking-widest mb-1.5">Status</p>
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                  <span className="text-[9px] font-bold text-muted-foreground capitalize">{status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ───── Problem count badge ───────────────────────────────────────── */}
      <div className="absolute bottom-10 right-4 z-[1000] bg-background/80 backdrop-blur-md rounded-xl px-3 py-1.5 border border-border/40 shadow-lg">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          {heatmapMode
            ? `${displayProblems.filter(p => p.status !== 'resolved').length} active issues`
            : `${displayProblems.length} total issues`
          }
        </p>
      </div>

      {/* ───── Selected marker popup ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedMarker && !onMarkerClick && !heatmapMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-14 left-4 right-4 md:right-auto md:w-[320px] bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border p-4 z-[1000]"
          >
            <button
              onClick={() => setSelectedMarker(null)}
              className="absolute top-3 right-3 p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-2xl ${statusColors[selectedMarker.status]} flex items-center justify-center shrink-0 shadow-lg`}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground truncate leading-tight">{selectedMarker.title}</h3>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{selectedMarker.category.replace('_', ' ')}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs font-black text-muted-foreground">
                    <ThumbsUp className="w-3 h-3" />
                    {selectedMarker.confirmed_count} verified
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedMarker.status === "resolved"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {selectedMarker.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1 rounded-xl font-bold text-xs h-8" asChild>
                <a href={`/dashboard/problem/${selectedMarker.id}`}>View Details</a>
              </Button>
              <Button size="sm" variant="outline" className="rounded-xl h-8 px-3">
                <Navigation className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Heatmap info banner ───────────────────────────────────────── */}
      {heatmapMode && (
        <div className="absolute bottom-10 left-4 right-36 bg-background/80 backdrop-blur-md rounded-xl border border-rose-500/20 px-3 py-2 z-[1000] flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <p className="text-[10px] font-bold text-muted-foreground">
            Red zones = infrastructure hotspots needing urgent attention
          </p>
        </div>
      )}
    </div>
  )
}
