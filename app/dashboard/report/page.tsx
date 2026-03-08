"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  MapPin,
  Camera,
  Upload,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)
    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...newFiles],
      images: [...prev.images, ...newFiles.map(f => URL.createObjectURL(f))]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to report a problem.")

      // 1. Upload images to Supabase Storage
      const uploadedImageUrls: string[] = []
      for (const file of formData.imageFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('problem-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('problem-images')
          .getPublicUrl(filePath)

        uploadedImageUrls.push(publicUrl)
      }

      // 2. Insert problem report into database
      const { error: insertError } = await supabase.from('problems').insert({
        title: formData.title,
        description: formData.description,
        category: formData.category as ProblemCategory,
        severity: formData.severity,
        lat: formData.lat,
        lng: formData.lng,
        address: formData.address,
        image_urls: uploadedImageUrls,
        reporter_id: user.id,
        status: 'reported',
      })

      if (insertError) throw insertError

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
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight">Report a Problem</h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Complete the steps below to report an infrastructure issue in your neighborhood.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-12">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-3">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${s < step
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : s === step
                    ? "bg-primary text-white shadow-xl shadow-primary/40 ring-4 ring-primary/10"
                    : "bg-muted text-muted-foreground"
                }`}
              animate={{ scale: s === step ? 1.05 : 1 }}
            >
              {s < step ? <Check className="w-5 h-5" /> : s}
            </motion.div>
            {s < 4 && (
              <div className={`flex-1 h-1.5 rounded-full ${s < step ? "bg-primary" : "bg-muted"}`} />
            )}
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
            <Card className="border-border/40 shadow-xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12">
                <h2 className="text-xl font-bold mb-8 text-center sm:text-left">What kind of issue are you reporting?</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      className={`group p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-4 ${formData.category === category.id
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                          : "border-transparent bg-muted/30 hover:bg-muted/60 hover:scale-[1.02]"
                        }`}
                    >
                      <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        <category.icon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm font-black text-center leading-tight tracking-tight">{category.label}</p>
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

                <Button variant="secondary" className="w-full h-14 rounded-2xl font-bold text-lg gap-3 shadow-lg shadow-primary/5">
                  <Navigation className="w-5 h-5" />
                  Detect Current Location
                </Button>

                <div className="h-80 rounded-[2rem] bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden border border-border/20 shadow-inner">
                  {/* Grid pattern */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                  {/* Mock Map UI */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                      </motion.div>
                      <div className="w-6 h-2 rounded-full bg-black/20 blur-[2px] mx-auto mt-1 animate-pulse" />
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md px-6 py-2 rounded-full border border-border/40 shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drag to pin exact location</p>
                  </div>
                </div>
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
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-2" />
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
  )
}
