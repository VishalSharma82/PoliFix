import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { MapPin, X, ThumbsUp, Navigation, Loader2, Flame, MapPinned, Layers, Sparkles } from "lucide-react"
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
} as const

type TileLayerKey = keyof typeof TILE_LAYERS

// ─── Marker Icons ─────────────────────────────────────────────────────────────
function createPriorityIcon(color: string, glowColor: string) {
  return L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
    html: `
      <div style="
        width:30px;height:30px;border-radius:50% 50% 50% 0;
        background:${color};border:3px solid rgba(255,255,255,0.95);
        box-shadow:0 4px 15px ${glowColor}, 0 0 20px ${glowColor};
        transform:rotate(-45deg);
        transition:all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
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
function MapController({ center, zoom, onMapChange }: { center: [number, number], zoom: number, onMapChange?: (c: [number, number], z: number) => void }) {
  const map = useMap()
  
  // Sync prop changes TO map
  useEffect(() => {
    const currentZoom = map.getZoom()
    const currentCenter = map.getCenter()
    const centerMatch = Math.abs(currentCenter.lat - center[0]) < 0.0001 && Math.abs(currentCenter.lng - center[1]) < 0.0001
    
    if ((currentZoom !== zoom || !centerMatch) && typeof center[0] === 'number' && typeof center[1] === 'number') {
      map.setView(center, zoom, { animate: true })
    }
  }, [map, center, zoom])

  // Sync map interactions BACK to parent
  useEffect(() => {
    const onMoveEnd = () => {
      onMapChange?.([map.getCenter().lat, map.getCenter().lng], map.getZoom())
    }
    map.on('moveend', onMoveEnd)
    return () => { map.off('moveend', onMoveEnd) }
  }, [map, onMapChange])

  useEffect(() => {
    setTimeout(() => { map.invalidateSize() }, 100)
  }, [map])
  
  return null
}

function HeatmapLayer({ problems, visible }: { problems: Problem[], visible: boolean }) {
  const map = useMap()
  const heatLayerRef = useRef<any>(null)

  useEffect(() => {
    if (!visible) {
      if (heatLayerRef.current) { map.removeLayer(heatLayerRef.current); heatLayerRef.current = null }
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('leaflet.heat')
      const points = problems
        .filter(p => p.status !== 'resolved')
        .map(p => [p.lat, p.lng, computePriorityScore(p) / 80] as [number, number, number])

      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current)
      if (points.length === 0) return

      // @ts-ignore
      heatLayerRef.current = (L as any).heatLayer(points, {
        radius: 45, blur: 30, maxZoom: 18, max: 1.0,
        gradient: { 0.0: 'rgba(34, 197, 94, 0.4)', 0.3: 'rgba(234, 179, 8, 0.6)', 0.7: 'rgba(249, 115, 22, 0.8)', 1.0: 'rgba(239, 68, 68, 0.95)' }
      }).addTo(map)
    } catch (e) { console.warn('Heatmap load failed', e) }

    return () => { if (heatLayerRef.current) map.removeLayer(heatLayerRef.current) }
  }, [map, problems, visible])

  return null
}

function PredictionLayer({ predictions, visible }: { predictions: any[], visible: boolean }) {
  const map = useMap()
  const layerRef = useRef<any>(null)

  useEffect(() => {
    if (!visible || !predictions.length) {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null }
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('leaflet.heat')
    const points = predictions.map(p => [p.lat, p.lng, p.intensity] as [number, number, number])

    if (layerRef.current) map.removeLayer(layerRef.current)
    // @ts-ignore
    layerRef.current = (L as any).heatLayer(points, {
      radius: 65, blur: 45, maxZoom: 18,
      gradient: { 0.0: 'rgba(99, 102, 241, 0.3)', 0.5: 'rgba(168, 85, 247, 0.5)', 1.0: 'rgba(236, 72, 153, 0.7)' }
    }).addTo(map)

    return () => { if (layerRef.current) map.removeLayer(layerRef.current) }
  }, [map, predictions, visible])

  return null
}

function ScaleControl() {
  const map = useMap()
  useEffect(() => {
    const scale = L.control.scale({ position: 'bottomleft', metric: true, imperial: false })
    scale.addTo(map)
    return () => { scale.remove() }
  }, [map])
  return null
}

interface InteractiveMapProps {
  problems?: Problem[]
  height?: string
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (problem: Problem) => void
  showHeatmap?: boolean
  predictions?: any[]
  showPredictions?: boolean
  onMapChange?: (center: [number, number], zoom: number) => void
}

export function InteractiveMap({
  problems: propsProblems,
  height = "400px",
  center,
  zoom = 13,
  onMarkerClick,
  showHeatmap: externalShowHeatmap,
  predictions = [],
  showPredictions: externalShowPredictions,
  onMapChange,
}: InteractiveMapProps) {
  const [internalProblems, setInternalProblems] = useState<Problem[]>([])
  const [heatmapMode, setHeatmapMode] = useState(externalShowHeatmap ?? false)
  const [predictionMode, setPredictionMode] = useState(externalShowPredictions ?? false)
  const [activeLayer, setActiveLayer] = useState<TileLayerKey>('street')
  const [showLayerSwitcher, setShowLayerSwitcher] = useState(false)
  const [hoveredPrediction, setHoveredPrediction] = useState<any>(null)

  const displayProblems = propsProblems || internalProblems

  useEffect(() => {
    if (externalShowHeatmap !== undefined) setHeatmapMode(externalShowHeatmap)
  }, [externalShowHeatmap])

  useEffect(() => {
    if (externalShowPredictions !== undefined) setPredictionMode(externalShowPredictions)
  }, [externalShowPredictions])

  useEffect(() => {
    if (propsProblems) return
    async function fetchProblems() {
      const { data } = await supabase.from('problems').select('*').limit(200)
      if (data) setInternalProblems(data)
    }
    fetchProblems()
  }, [propsProblems])

  const defaultCenter: [number, number] = center || [12.9716, 77.5946]
  const currentTile = TILE_LAYERS[activeLayer]

  function getIcon(problem: Problem) {
    const score = computePriorityScore(problem)
    if (score >= 50) return PRIORITY_ICONS.CRITICAL
    if (score >= 30) return PRIORITY_ICONS.HIGH
    if (score >= 15) return PRIORITY_ICONS.MEDIUM
    return PRIORITY_ICONS.LOW
  }

  return (
    <div style={{ height }} className="relative rounded-[2rem] overflow-hidden border shadow-xl z-0">
      <MapContainer center={defaultCenter} zoom={zoom} scrollWheelZoom={true} zoomControl={false} className="h-full w-full">
        <TileLayer key={activeLayer} attribution={currentTile.attribution} url={currentTile.url} />
        <MapController center={defaultCenter} zoom={zoom} onMapChange={onMapChange} />
        <ScaleControl />
        <HeatmapLayer problems={displayProblems} visible={heatmapMode} />
        <PredictionLayer predictions={predictions} visible={predictionMode} />

        {!heatmapMode && !predictionMode && displayProblems
          .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng))
          .map((problem) => (
            <Marker key={problem.id} position={[problem.lat, problem.lng]} icon={getIcon(problem)} eventHandlers={{
              click: () => onMarkerClick?.(problem),
            }}>
              <Popup className="rounded-2xl">
              <div className="p-2 min-w-[160px]">
                <h3 className="font-bold text-sm mb-1">{problem.title}</h3>
                <p className="text-[10px] text-muted-foreground uppercase opacity-70 mb-2">{problem.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${statusColors[problem.status]}`} />
                    <span className="text-[10px] font-bold uppercase">{problem.status.replace('_', ' ')}</span>
                  </div>
                  <span className="text-[10px] font-black">✓ {problem.confirmed_count}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {predictionMode && predictions.map((pred, i) => (
          <Marker 
            key={i} 
            position={[pred.lat, pred.lng]} 
            icon={L.divIcon({ 
              className: '', 
              html: `<div class="w-8 h-8 rounded-full bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center animate-pulse"><div class="w-2 h-2 bg-pink-500 rounded-full"></div></div>`
            })}
          >
            <Popup className="rounded-2xl overflow-hidden border-none shadow-2xl">
              <div className="p-4 w-[240px] bg-background/95 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">AI Risk Prediction</span>
                </div>
                <h4 className="font-black text-lg mb-2 leading-tight">Potential {pred.type} Failure</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4">
                  {pred.reason}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border/20">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Confidence</span>
                  <span className="text-xs font-black text-pink-600">{(pred.intensity * 100).toFixed(0)}%</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2 flex-wrap">
        <div className="flex gap-1.5 bg-background/80 backdrop-blur-md rounded-2xl p-1.5 border border-border/40 shadow-lg">
          <button onClick={() => { setHeatmapMode(false); setPredictionMode(false) }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${!heatmapMode && !predictionMode ? 'bg-primary text-white shadow-md' : 'text-muted-foreground'}`}><MapPinned className="w-3.5 h-3.5 mr-1 inline" />Markers</button>
          <button onClick={() => { setHeatmapMode(true); setPredictionMode(false) }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${heatmapMode ? 'bg-rose-500 text-white shadow-md' : 'text-muted-foreground'}`}><Flame className="w-3.5 h-3.5 mr-1 inline" />Heatmap</button>
          <button onClick={() => { setPredictionMode(true); setHeatmapMode(false) }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${predictionMode ? 'bg-indigo-600 text-white shadow-md' : 'text-muted-foreground'}`}><Sparkles className="w-3.5 h-3.5 mr-1 inline" />Predictions</button>
        </div>

        <div className="relative">
          <button onClick={() => setShowLayerSwitcher(!showLayerSwitcher)} className="px-3 py-2 rounded-2xl text-[10px] font-black uppercase bg-background/80 backdrop-blur-md border border-border/40 shadow-lg flex items-center gap-2"><Layers className="w-3.5 h-3.5" />{TILE_LAYERS[activeLayer].label}</button>
          <AnimatePresence>
            {showLayerSwitcher && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute top-full mt-2 left-0 z-[2000] bg-background/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl p-1.5 min-w-[140px]">
                {(Object.keys(TILE_LAYERS) as TileLayerKey[]).map(key => (
                  <button key={key} onClick={() => { setActiveLayer(key); setShowLayerSwitcher(false) }} className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold ${activeLayer === key ? 'bg-primary text-white' : 'text-muted-foreground'}`}>{TILE_LAYERS[key].emoji} {TILE_LAYERS[key].label}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-6 right-6 z-[1000] glass px-6 py-6 rounded-[2.5rem] shadow-premium border-white/20 min-w-[240px]">
        {predictionMode ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80 text-pink-600">AI Risk Forecast</p>
            {[ { label: 'Severe Risk', c: 'bg-pink-500' }, { label: 'High Probability', c: 'bg-purple-500' }, { label: 'Medium Concern', c: 'bg-indigo-500' } ].map(({ label, c }) => (
              <div key={label} className="flex items-center gap-3 mb-2">
                <span className={`w-3 h-3 rounded-full ${c} shadow-md ring-2 ring-white/50`} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{label}</span>
              </div>
            ))}
          </>
        ) : heatmapMode ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80">Impact Heat</p>
            {[ { label: 'Critical', c: 'bg-red-500' }, { label: 'High', c: 'bg-orange-500' }, { label: 'Medium', c: 'bg-yellow-500' }, { label: 'Low', c: 'bg-green-500' } ].map(({ label, c }) => (
              <div key={label} className="flex items-center gap-3 mb-2">
                <span className={`w-2 h-2 rounded-full ${c} shadow-md`} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{label} Intensity</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80">Marker Legend</p>
            {Object.entries(PRIORITY_ICONS).map(([lvl, icon]) => (
              <div key={lvl} className="flex items-center gap-3 mb-2.5">
                <div className="w-4 h-4 flex items-center justify-center translate-y-0.5">
                  <div className="w-2 h-2 rounded-full ring-2 ring-white/50" style={{ background: lvl === 'CRITICAL' ? '#ef4444' : lvl === 'HIGH' ? '#f97316' : lvl === 'MEDIUM' ? '#eab308' : '#22c55e' }} />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{lvl} Priority</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
