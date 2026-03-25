"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  MapPin,
  Camera,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Droplets,
  TreePine,
  Shield,
  Navigation,
  Loader2,
  Sparkles,
  Brain,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
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

type ProblemCategory = Database["public"]["Tables"]["problems"]["Row"]["category"]
type ProblemSeverity = Database["public"]["Tables"]["problems"]["Row"]["severity"]

const categories: { id: ProblemCategory; label: string; icon: any; color: string }[] = [
  { id: "pothole", label: "Pothole", icon: AlertTriangle, color: "bg-amber-500" },
  { id: "streetlight", label: "Street Lighting", icon: Lightbulb, color: "bg-yellow-500" },
  { id: "garbage", label: "Waste & Garbage", icon: Trash2, color: "bg-green-500" },
  { id: "water_leak", label: "Water Leak", icon: Droplets, color: "bg-blue-500" },
  { id: "road_damage", label: "Road Damage", icon: TreePine, color: "bg-emerald-500" },
  { id: "safety_issue", label: "Public Safety", icon: Shield, color: "bg-red-500" },
]

const urgencyLevels: { id: ProblemSeverity; label: string; description: string; color: string }[] = [
  { id: "low", label: "Low", description: "Minor inconvenience", color: "border-green-500 bg-green-500/10 text-green-600" },
  { id: "medium", label: "Medium", description: "Needs attention soon", color: "border-amber-500 bg-amber-500/10 text-amber-600" },
  { id: "high", label: "High", description: "Safety hazard", color: "border-red-500 bg-red-500/10 text-red-600" },
  { id: "critical", label: "Critical", description: "Emergency action required", color: "border-critical bg-critical/10 text-critical" },
]

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])
  return null
}

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  const map = useMap()

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return position ? (
    <Marker
      position={position}
      interactive={true}
      draggable={true}
      icon={defaultIcon}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          const newPos = marker.getLatLng()
          setPosition([newPos.lat, newPos.lng])
        }
      }}
    />
  ) : null
}

export default function ReportPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    category: "" as ProblemCategory | "",
    title: "",
    description: "",
    address: "",
    lat: 12.9716,
    lng: 77.5946,
    severity: "medium" as ProblemSeverity,
    images: [] as string[],
    imageFiles: [] as File[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<{ category: ProblemCategory, severity: ProblemSeverity, isHeuristic?: boolean } | null>(null)
  const [duplicateCheck, setDuplicateCheck] = useState<{
    isChecking: boolean,
    found: any[],
    aiResult?: {
      isDuplicate: boolean,
      duplicateId: string | null,
      score: number,
      reason: string
    }
  }>({
    isChecking: false,
    found: [],
  })

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)
    setAiSuggestion(null)
    
    try {
      // Helper to convert file to base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = error => reject(error);
        });
      };

      const base64Image = await fileToBase64(file);
      
      const response = await fetch(`/api/v1/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          mimeType: file.type,
          filename: file.name, // send filename for keyword-based fallback
        }),
      });

      const json = await response.json();
      const data = json.data;
      
      if (data) {
        setAiSuggestion({ 
          category: data.category as ProblemCategory, 
          severity: data.severity as ProblemSeverity,
          isHeuristic: !!json.isHeuristic,
        });
      }
    } catch (err) {
      console.error("AI Analysis error:", err);
      // Silent fail — user still fills in manually
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
 
    const newFiles = Array.from(files)
    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...newFiles],
      images: [...prev.images, ...newFiles.map(f => URL.createObjectURL(f))]
    }))

    // Start AI analysis for the first new image
    if (newFiles.length > 0) {
      analyzeImage(newFiles[0])
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }))
  }

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await response.json()
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }))
      }
    } catch (err) {
      console.error("Failed to fetch address:", err)
    }
  }

  const handleDetectLocation = () => {
    setIsDetectingLocation(true)
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsDetectingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }))
        await fetchAddress(latitude, longitude)
        setIsDetectingLocation(false)
      },
      (err) => {
        setError("Unable to retrieve your location")
        setIsDetectingLocation(false)
      }
    )
  }

  useEffect(() => {
    if (step === 3 && formData.address === "") {
      handleDetectLocation()
    }
  }, [step])

  const checkForDuplicates = async () => {
    if (!formData.category || !formData.lat || !formData.lng) return

    setDuplicateCheck(prev => ({ ...prev, isChecking: true }))
    
    try {
      // Approx 50 meters in degrees (~0.00045)
      const threshold = 0.00045
      
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('category', formData.category)
        .neq('status', 'resolved')
        .gte('lat', formData.lat - threshold)
        .lte('lat', formData.lat + threshold)
        .gte('lng', formData.lng - threshold)
        .lte('lng', formData.lng + threshold)
        .limit(3)

      if (error) throw error
      
      if (data && data.length > 0) {
        // Now call AI to check similarity more deeply
        try {
          const aiResponse = await fetch(`/api/v1/ai/check-duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              newProblem: {
                title: formData.title,
                description: formData.description,
                category: formData.category
              },
              candidates: data
            })
          });
          const aiData = await aiResponse.json();
          setDuplicateCheck({ 
            isChecking: false, 
            found: data, 
            aiResult: aiData.data 
          });
        } catch (aiErr) {
          console.error("AI Duplicate Check Failed:", aiErr);
          setDuplicateCheck({ isChecking: false, found: data });
        }
        return true
      } else {
        setDuplicateCheck({ isChecking: false, found: [] })
        return false
      }
    } catch (err) {
      console.error("Duplicate check error:", err)
      setDuplicateCheck({ isChecking: false, found: [] })
      return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to report a problem.")

      // 1. Upload images to Supabase Storage (storage not affected by table RLS)
      const uploadedImageUrls: string[] = []
      for (const file of formData.imageFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('problem-images')
          .upload(filePath, file)

        if (uploadError) {
          // Storage might not be configured — skip image upload but continue
          console.warn("Image upload skipped:", uploadError.message)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('problem-images')
          .getPublicUrl(filePath)

        uploadedImageUrls.push(publicUrl)
      }

      // 2. Insert via backend server (uses service role key — bypasses RLS completely)
      const response = await fetch(`/api/v1/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          severity: formData.severity,
          lat: formData.lat,
          lng: formData.lng,
          address: formData.address,
          image_urls: uploadedImageUrls,
          reporter_id: user.id,
          status: 'reported',
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to submit report')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.category !== ""
      case 2:
        return formData.title.length >= 5 && formData.description.length >= 10
      case 3:
        return formData.address !== ""
      case 4:
        return true
      default:
        return false
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-success" />
          </motion.div>

          <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight">Report Received!</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Your contribution is being verified by the community. You'll receive updates as the status changes.
          </p>

          <Card className="text-left mb-8 border-border/40 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${categories.find(c => c.id === formData.category)?.color} flex items-center justify-center shrink-0 shadow-lg`}>
                  {(() => {
                    const Icon = categories.find(c => c.id === formData.category)?.icon || MapPin
                    return <Icon className="w-7 h-7 text-white" />
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground leading-tight">{formData.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {formData.address}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Pending Review
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">In verification queue</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="h-12 px-8">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button variant="outline" className="h-12 px-8" asChild>
              <Link href="/dashboard/report">Report Another Issue</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh py-8 px-4">
      <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight">Report a Problem</h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Complete the steps below to report an infrastructure issue in your neighborhood.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between gap-2 mb-16 px-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-3 group">
            <div className="flex items-center w-full gap-2">
               <div className={cn("h-1 flex-1 rounded-full bg-border/20 overflow-hidden", s <= step && "bg-transparent")}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: s < step ? "100%" : "0%" }}
                    className="h-full bg-primary"
                  />
               </div>
               <motion.div
                 className={cn(
                   "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all shrink-0",
                   s < step ? "bg-primary text-white shadow-xl shadow-primary/20" :
                   s === step ? "bg-primary/20 text-primary ring-2 ring-primary/40 shadow-glow" :
                   "bg-muted/30 text-muted-foreground border border-white/5"
                 )}
                 animate={{ scale: s === step ? 1.1 : 1 }}
               >
                 {s < step ? <Check className="w-5 h-5" /> : s}
               </motion.div>
               <div className={cn("h-1 flex-1 rounded-full bg-border/20 overflow-hidden", s < step && "bg-transparent")}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: s < step ? "100%" : "0%" }}
                    className="h-full bg-primary"
                  />
               </div>
            </div>
            <span className={cn(
               "text-[10px] font-black uppercase tracking-widest transition-colors",
               s === step ? "text-primary" : "text-muted-foreground/60"
            )}>
               {s === 1 ? "Issue" : s === 2 ? "Details" : s === 3 ? "Location" : "Confirm"}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-8 border-destructive/20 bg-destructive/5 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Submission Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <Card className="glass-strong shadow-premium border-white/10 rounded-[3rem] overflow-hidden">
              <CardContent className="p-10 lg:p-14">
                <div className="flex flex-col items-center text-center mb-12">
                   <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                      <Sparkles className="w-8 h-8 text-primary" />
                   </div>
                   <h2 className="text-3xl font-black text-foreground tracking-tight">Select Issue Category</h2>
                   <p className="text-muted-foreground mt-2 max-w-sm">Help us route your report to the right department by choosing a category.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      className={cn(
                        "hover-lift group p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center gap-4 relative overflow-hidden",
                        formData.category === category.id
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "border-white/5 bg-white/5 glass hover:bg-white/10"
                      )}
                    >
                      {formData.category === category.id && (
                         <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <Check className="w-3.5 h-3.5 text-white" />
                         </div>
                      )}
                      <div className={cn(
                         "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110",
                         category.color
                      )}>
                        <category.icon className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-sm font-black text-center leading-tight tracking-tight uppercase tracking-[0.1em]">{category.label}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-border/40 shadow-xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12 space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Title</label>
                  <Input
                    placeholder="e.g. Broken streetlight on 5th Avenue"
                    className="h-14 px-6 text-lg rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground font-medium">Briefly describe the issue (min 5 characters)</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Description</label>
                  <Textarea
                    placeholder="Provide detailed information about the issue. How long has it been there? Any specific hazards?"
                    className="min-h-[160px] p-6 text-lg rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground font-medium">Detailed explanation (min 10 characters)</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Urgency Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {urgencyLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setFormData({ ...formData, severity: level.id })}
                        className={`p-4 rounded-2xl border-2 transition-all text-center ${formData.severity === level.id ? level.color : "border-muted/50 hover:bg-muted/30"
                          }`}
                      >
                        <p className="font-black text-xs uppercase tracking-tighter">{level.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Photos (Recommended)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group shadow-md border border-border/20">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {isAnalyzing && index === 0 && (
                          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Scanning...</span>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-8 h-8 text-white" />
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 4 && (
                      <label
                        className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                      >
                        <Input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Add Photo</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* AI Analysis section */}
                <AnimatePresence>
                  {(isAnalyzing || aiSuggestion) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Card className="border-primary/20 bg-primary/5 rounded-2xl overflow-hidden mt-4">
                        <CardContent className="p-6">
                          {isAnalyzing ? (
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                  <Brain className="w-6 h-6 text-primary" />
                                </div>
                                <motion.div 
                                  className="absolute inset-0 bg-primary/20 rounded-xl"
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-foreground">AI Visual Analysis In Progress...</h4>
                                <p className="text-xs text-muted-foreground">Scanning images to suggest category and severity.</p>
                              </div>
                              <div className="ml-auto flex gap-1">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-primary"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : aiSuggestion && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${aiSuggestion.isHeuristic ? 'bg-amber-500/10' : 'bg-success/10'} flex items-center justify-center`}>
                                  <Sparkles className={`w-5 h-5 ${aiSuggestion.isHeuristic ? 'text-amber-500' : 'text-success'}`} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-foreground">
                                    {aiSuggestion.isHeuristic ? '🧠 Smart Estimate (AI offline)' : '✨ AI Intelligence Suggestion'}
                                  </h4>
                                  {aiSuggestion.isHeuristic && (
                                    <p className="text-[10px] text-amber-600 font-medium">AI quota reached — adjust manually if needed</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-xl bg-background/50 border border-border/40">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Detected Category</p>
                                  <p className="text-sm font-bold flex items-center gap-2">
                                    {categories.find(c => c.id === aiSuggestion.category)?.label}
                                  </p>
                                </div>
                                <div className="p-3 rounded-xl bg-background/50 border border-border/40">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Recommended Urgency</p>
                                  <p className="text-sm font-bold flex items-center gap-2 text-foreground">
                                    <span className={`w-2 h-2 rounded-full ${urgencyLevels.find(l => l.id === aiSuggestion.severity)?.color}`} />
                                    {urgencyLevels.find(l => l.id === aiSuggestion.severity)?.label}
                                  </p>
                                </div>
                              </div>
                              
                              <Button 
                                size="sm" 
                                className="w-full rounded-xl h-10 font-bold gap-2 shadow-lg shadow-primary/10"
                                onClick={() => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    category: aiSuggestion.category, 
                                    severity: aiSuggestion.severity 
                                  }))
                                  setAiSuggestion(null)
                                }}
                              >
                                <Zap className="w-4 h-4" />
                                Apply Suggested Details
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-border/40 shadow-xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12 space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Location Details</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Street address, neighborhood, or landmark"
                      className="h-14 pl-14 pr-6 text-lg rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full h-14 rounded-2xl font-bold text-lg gap-3 shadow-lg shadow-primary/5"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                >
                  {isDetectingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                  Detect Current Location
                </Button>

                <div className="h-[400px] rounded-[2.5rem] relative overflow-hidden border border-white/10 shadow-2xl z-0 group">
                  <MapContainer
                    center={[formData.lat, formData.lng]}
                    zoom={15}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapResizer />
                    <LocationMarker
                      position={[formData.lat, formData.lng]}
                      setPosition={(p) => {
                        setFormData(prev => ({ ...prev, lat: p[0], lng: p[1] }))
                        fetchAddress(p[0], p[1])
                      }}
                    />
                  </MapContainer>

                  <div className="absolute inset-x-6 bottom-6 flex justify-center z-[1000] pointer-events-none">
                    <div className="glass-strong bg-background/60 px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 animate-bounce">
                      <Navigation className="w-4 h-4 text-primary" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Click or Drag to set location</p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {duplicateCheck.found.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6"
                    >
                      <Alert className="border-amber-500/50 bg-amber-500/5 rounded-2xl">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <div className="ml-3">
                          <AlertTitle className="text-amber-700 font-bold mb-1">
                            {duplicateCheck.aiResult?.isDuplicate 
                              ? "Potential Duplicate Detected by AI" 
                              : "Similar issue already reported nearby!"}
                          </AlertTitle>
                          <AlertDescription className="text-amber-600/80 mb-4">
                            {duplicateCheck.aiResult?.isDuplicate 
                              ? `AI Audit (Score: ${duplicateCheck.aiResult.score}%): ${duplicateCheck.aiResult.reason}`
                              : `We found ${duplicateCheck.found.length} similar report(s) in this area. Please confirm an existing issue instead of creating a duplicate.`}
                          </AlertDescription>
                          <div className="space-y-3">
                            {duplicateCheck.found.map((dup) => {
                              const isAiMatch = duplicateCheck.aiResult?.duplicateId === dup.id;
                              return (
                                <div key={dup.id} className={`p-3 bg-white/50 rounded-xl border ${isAiMatch ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20' : 'border-amber-200'} flex items-center justify-between`}>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-bold text-amber-900 truncate">{dup.title}</p>
                                      {isAiMatch && <Badge className="bg-primary text-[8px] h-4">AI MATCH</Badge>}
                                    </div>
                                    <p className="text-[10px] font-medium text-amber-700">{dup.address || "Near your location"}</p>
                                  </div>
                                  <Button size="sm" variant={isAiMatch ? "default" : "outline"} className={`h-8 rounded-lg text-[10px] font-black uppercase ${!isAiMatch ? 'border-amber-300 hover:bg-amber-100' : ''}`} asChild>
                                    <Link href={`/dashboard/problem/${dup.id}`}>View & Confirm</Link>
                                  </Button>
                                </div>
                              );
                            })}
                            <div className="pt-2 border-t border-amber-200/50 flex gap-3">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-[10px] font-black uppercase text-amber-700 hover:bg-amber-100"
                                onClick={() => setDuplicateCheck({ isChecking: false, found: [] })}
                              >
                                I'm Sure It's Different
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase shadow-lg shadow-amber-500/20"
                                onClick={() => setStep(step + 1)}
                              >
                                Continue Anyway
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="border-border/40 shadow-xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12">
                <h2 className="text-2xl font-black mb-8 tracking-tight">Review Your Submission</h2>

                <div className="grid gap-6">
                  <div className="flex items-center gap-6 p-6 bg-background/50 rounded-3xl border border-border/20">
                    <div className={`w-16 h-16 rounded-2xl ${categories.find(c => c.id === formData.category)?.color} flex items-center justify-center shrink-0 shadow-lg`}>
                      {(() => {
                        const Icon = categories.find(c => c.id === formData.category)?.icon || MapPin
                        return <Icon className="w-8 h-8 text-white" />
                      })()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Issue Category</p>
                      <p className="text-lg font-bold">{categories.find(c => c.id === formData.category)?.label}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-background/50 rounded-3xl border border-border/20 space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Problem Details</p>
                      <h3 className="text-lg font-bold mb-2">{formData.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{formData.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-border/20">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Location</p>
                        <p className="font-bold flex items-center gap-2 text-sm bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 w-fit">
                          <MapPin className="w-4 h-4 text-primary" />
                          {formData.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Severity</p>
                        <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${urgencyLevels.find(l => l.id === formData.severity)?.color}`}>
                          {urgencyLevels.find(l => l.id === formData.severity)?.label} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="p-6 bg-background/50 rounded-3xl border border-border/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Evidence Photos</p>
                      <div className="flex flex-wrap gap-3">
                        {formData.images.map((img, index) => (
                          <div key={index} className="w-24 h-24 rounded-2xl overflow-hidden border border-border/20 shadow-sm">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-12 gap-4">
        <Button
          variant="outline"
          className="h-14 px-8 rounded-2xl font-bold flex-1 sm:flex-initial"
          onClick={() => setStep(step - 1)}
          disabled={step === 1 || isSubmitting}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        {step < 4 ? (
          <Button
            className="h-14 px-10 rounded-2xl font-bold flex-1 sm:flex-initial shadow-xl shadow-primary/20"
            onClick={async () => {
              if (step === 3) {
                const hasDuplicates = await checkForDuplicates()
                if (!hasDuplicates) setStep(step + 1)
              } else {
                setStep(step + 1)
              }
            }}
            disabled={!canProceed() || (step === 3 && duplicateCheck.isChecking)}
          >
            {step === 3 && duplicateCheck.isChecking ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button
            className="h-14 px-10 rounded-2xl font-bold flex-1 sm:flex-initial shadow-xl shadow-primary/30"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Report Issue
                <Check className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
      </div>
    </div>
  )
}
