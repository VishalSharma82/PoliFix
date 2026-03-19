"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Camera,
  Loader2,
  Check,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Brain,
  Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

type Tab = "profile" | "notifications" | "privacy" | "appearance"

const tabs: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "profile",       label: "Identity",      icon: User,     color: "text-blue-500"   },
  { id: "notifications", label: "Pulse",         icon: Bell,     color: "text-amber-500"  },
  { id: "privacy",       label: "Security",      icon: Shield,   color: "text-green-500"  },
  { id: "appearance",    label: "Experience",    icon: Palette,  color: "text-purple-500" },
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [profileState, setProfileState] = useState({
    name: "", email: "", phone: "", bio: "", location: "",
  })

  const [notifications, setNotifications] = useState({
    email: true, push: true, reports: true, comments: false, weekly: false,
  })

  const [privacy, setPrivacy] = useState({
    publicProfile: true, showLocation: true, showStats: true, anonymous: false,
  })

  const [appearance, setAppearance] = useState({
    language: "en", compactMode: false, reduceAnimations: false, theme: "system"
  })

  // Apply UI settings globally
  useEffect(() => {
    const root = document.documentElement
    if (appearance.compactMode) root.classList.add("compact")
    else root.classList.remove("compact")
    
    if (appearance.reduceAnimations) root.classList.add("reduce-motion")
    else root.classList.remove("reduce-motion")
  }, [appearance.compactMode, appearance.reduceAnimations])

  useEffect(() => {
    async function fetchSettings() {
      // 1. Load from localStorage first for immediate UI response
      const savedPrefs = localStorage.getItem("polifix_preferences")
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs)
        if (parsed.notifications) setNotifications(parsed.notifications)
        if (parsed.privacy) setPrivacy(parsed.privacy)
        if (parsed.appearance) setAppearance(parsed.appearance)
      }

      // 2. Fetch from Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)

      const { data: profileData } = await (supabase.from('profiles') as any)
        .select('*').eq('id', user.id).single()

      if (profileData) {
        setProfileState({
          name: profileData.full_name || "",
          email: user.email || "",
          phone: profileData.phone || "", // Note: Might be null if column missing
          bio: profileData.bio || "",
          location: profileData.location || "",
        })
        
        // Sync localStorage with DB if DB has preferences
        if (profileData.preferences) {
          const prefs = profileData.preferences
          if (prefs.notifications) setNotifications(prev => ({ ...prev, ...prefs.notifications }))
          if (prefs.privacy) setPrivacy(prev => ({ ...prev, ...prefs.privacy }))
          if (prefs.appearance) setAppearance(prev => ({ ...prev, ...prefs.appearance }))
          // Update localStorage
          localStorage.setItem("polifix_preferences", JSON.stringify(prefs))
        }
      }
      setLoading(false)
    }
    fetchSettings()
  }, [router])

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false)
    
    // Save to localStorage immediately
    const prefs = { notifications, privacy, appearance }
    localStorage.setItem("polifix_preferences", JSON.stringify(prefs))

    try {
      const updateData: any = {
        id: user.id,
        full_name: profileState.name,
        bio: profileState.bio,
        location: profileState.location,
      }

      // 1. Primary Profile Upsert
      const { error: upsertError } = await (supabase.from('profiles') as any).upsert(updateData)
      if (upsertError) throw upsertError
      
      // 2. Secondary update for phone/preferences (might fail if columns missing)
      const { error: secondaryError } = await (supabase.from('profiles') as any).update({ 
        phone: profileState.phone,
        // Using a dynamic key or checking if we should try this
      }).eq('id', user.id)

      if (secondaryError && secondaryError.code !== 'PGRST204') {
        console.warn("Secondary fields (phone/preferences) could not be saved to DB. Saved locally instead.")
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error("Save Error:", err)
      setError(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-glow animate-pulse">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Loading Settings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage your profile, notifications, and preferences.</p>
      </motion.div>

      {/* Toast */}
      {(error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm",
            success ? "bg-green-500/10 border border-green-500/30 text-green-600" : "bg-red-500/10 border border-red-500/30 text-red-600"
          )}
        >
          {success ? <Check className="w-5 h-5 shrink-0" /> : <Shield className="w-5 h-5 shrink-0" />}
          {error || (
             <span>
               Settings saved successfully! 
               <span className="text-xs ml-2 opacity-70">(Synced with Local Storage)</span>
             </span>
          )}
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar tabs */}
        <div className="lg:w-64 shrink-0">
          <Card className="border-border/40 rounded-[2rem] shadow-data bg-card/60 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-3">
              {tabs.map((tab, i) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all group",
                    activeTab === tab.id
                      ? "bg-blue-500/10 text-blue-600 font-black"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground font-bold"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                    activeTab === tab.id ? "bg-blue-500/15" : "bg-muted/40 group-hover:bg-muted"
                  )}>
                    <tab.icon className={cn("w-4.5 h-4.5", activeTab === tab.id ? "text-blue-600" : tab.color)} />
                  </div>
                  <span className="text-sm">{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto text-blue-500" />}
                </motion.button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Save */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 h-14 rounded-3xl font-black text-xs uppercase tracking-widest gap-3 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all border-0 group"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            {saving ? "Syncing..." : "Sync All Changes"}
          </Button>

          <div className="mt-8 p-6 rounded-[2rem] glass border border-white/5 space-y-4">
             <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">System Health</span>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase">
                   <span>Storage</span>
                   <span>82%</span>
                </div>
                <div className="h-1 rounded-full bg-border/20 overflow-hidden">
                   <div className="h-full bg-primary w-[82%]" />
                </div>
             </div>
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>

            {/* ─── PROFILE TAB ─── */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Avatar section */}
                <Card className="border-border/40 rounded-[2rem] shadow-data bg-card/60 backdrop-blur-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                  <CardContent className="p-8">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Profile Picture</p>
                    <div className="flex items-center gap-8">
                      <div className="relative shrink-0">
                        <Avatar className="w-24 h-24 border-4 border-background shadow-xl ring-2 ring-blue-500/20">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl font-black">
                            {profileState.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <button className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors border-2 border-background">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="rounded-xl font-bold border-border/40 hover:border-blue-500/40">
                          Upload New Photo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">JPG, PNG or GIF · Max 2MB</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal info */}
                <Card className="border-border/40 rounded-[2rem] shadow-data bg-card/60 backdrop-blur-xl">
                  <CardContent className="p-8 space-y-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Personal Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Full Name</label>
                        <Input
                          value={profileState.name}
                          onChange={(e) => setProfileState({ ...profileState, name: e.target.value })}
                          className="h-12 rounded-xl border-border/40 bg-background/50 font-bold focus:border-blue-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Email</label>
                        <Input
                          type="email"
                          value={profileState.email}
                          disabled
                          className="h-12 rounded-xl border-border/20 bg-muted/30 font-bold opacity-60 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Phone</label>
                        <Input
                          value={profileState.phone}
                          onChange={(e) => setProfileState({ ...profileState, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          className="h-12 rounded-xl border-border/40 bg-background/50 font-bold focus:border-blue-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Location</label>
                        <Input
                          value={profileState.location}
                          onChange={(e) => setProfileState({ ...profileState, location: e.target.value })}
                          placeholder="City, State"
                          className="h-12 rounded-xl border-border/40 bg-background/50 font-bold focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Bio</label>
                      <Textarea
                        value={profileState.bio}
                        onChange={(e) => setProfileState({ ...profileState, bio: e.target.value })}
                        rows={3}
                        placeholder="Tell the community about yourself..."
                        className="rounded-xl border-border/40 bg-background/50 font-medium resize-none focus:border-blue-500/50"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card className="border-border/40 rounded-[2rem] shadow-data bg-card/60 backdrop-blur-xl">
                  <CardContent className="p-8 space-y-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Change Password</p>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Current Password</label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••"
                          className="h-12 rounded-xl border-border/40 bg-background/50 font-bold pr-12 focus:border-blue-500/50" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">New Password</label>
                        <Input type="password" placeholder="••••••••"
                          className="h-12 rounded-xl border-border/40 bg-background/50 font-bold focus:border-blue-500/50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Confirm Password</label>
                        <Input type="password" placeholder="••••••••"
                          className="h-12 rounded-xl border-border/40 bg-background/50 font-bold focus:border-blue-500/50" />
                      </div>
                    </div>
                    <Button disabled variant="outline" className="rounded-xl font-bold border-border/40 text-xs">
                      <Lock className="w-4 h-4 mr-2" /> Update Password (OAuth users not supported)
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── NOTIFICATIONS TAB ─── */}
            {activeTab === "notifications" && (
              <Card className="border-border/40 rounded-[2rem] shadow-data bg-card/60 backdrop-blur-xl">
                <CardContent className="p-8 space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Notification Preferences</p>
                  {[
                    { id: "email",    icon: Mail,       title: "Email Notifications",  desc: "Updates about your reports via email" },
                    { id: "push",     icon: Smartphone, title: "Push Notifications",    desc: "Real-time alerts on your device" },
                    { id: "reports",  icon: Bell,       title: "Report Updates",        desc: "Notify when your reports are verified or resolved" },
                    { id: "comments", icon: User,       title: "Comments",              desc: "Get notified when someone comments on your reports" },
                    { id: "weekly",   icon: Globe,      title: "Weekly Digest",         desc: "Weekly summary of community activity" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-background/50 border border-border/20 hover:border-blue-500/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10 group-hover:bg-blue-500/15 transition-colors">
                          <item.icon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications[item.id as keyof typeof notifications]}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.id]: checked }))}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ─── PRIVACY TAB ─── */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <Card className="border-border/40 rounded-[2rem] shadow-data bg-card/60 backdrop-blur-xl">
                  <CardContent className="p-8 space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Privacy Controls</p>
                    {[
                      { id: "publicProfile", title: "Public Profile",      desc: "Make your profile visible to other users" },
                      { id: "showLocation",  title: "Show Location",        desc: "Display your general location on your profile" },
                      { id: "showStats",     title: "Show Statistics",      desc: "Display your contribution stats publicly" },
                      { id: "anonymous",     title: "Anonymous Reporting",  desc: "Hide your name on reports by default" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-background/50 border border-border/20 hover:border-green-500/20 transition-all">
                        <div>
                          <p className="font-black text-sm text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.desc}</p>
                        </div>
                        <Switch
                          checked={privacy[item.id as keyof typeof privacy]}
                          onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, [item.id]: checked }))}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-red-500/20 rounded-[2rem] shadow-data bg-red-500/5 backdrop-blur-xl">
                  <CardContent className="p-8">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">⚠ Danger Zone</p>
                    <div className="flex items-center justify-between p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
                      <div>
                        <p className="font-black text-sm text-red-600">Delete Account</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Permanently delete your account and all associated data</p>
                      </div>
                      <Button variant="destructive" size="sm" className="rounded-xl font-bold shrink-0">Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── APPEARANCE TAB ─── */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                {/* Theme */}
                <Card className="border-border/40 rounded-[2rem] shadow-data bg-card/60 backdrop-blur-xl">
                  <CardContent className="p-8 space-y-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Theme</p>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light",  label: "Light",  icon: Sun },
                        { value: "dark",   label: "Dark",   icon: Moon },
                        { value: "system", label: "System", icon: Monitor },
                      ].map((t) => (
                        <button
                          key={t.value}
                          onClick={() => {
                            setTheme(t.value)
                            setAppearance(prev => ({ ...prev, theme: t.value }))
                          }}
                          className={cn(
                            "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all font-black text-sm",
                            theme === t.value
                              ? "border-blue-500 bg-blue-500/10 text-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                              : "border-border/40 bg-background/30 text-muted-foreground hover:border-border hover:text-foreground"
                          )}
                        >
                          <t.icon className="w-6 h-6" />
                          {t.label}
                          {theme === t.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI & Features */}
                <Card className="border-border/40 rounded-[2rem] shadow-data bg-card/60 backdrop-blur-xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                       <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Advanced Features</p>
                          <h3 className="text-xl font-black italic uppercase">Intelligence & UX</h3>
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow-sm">
                          <Zap className="w-6 h-6 text-primary" />
                       </div>
                    </div>

                    <div className="space-y-4 pt-4">
                       <div className="flex items-center justify-between p-5 rounded-[2rem] glass border border-white/5 hover:border-primary/20 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Brain className="w-6 h-6 text-primary" />
                             </div>
                             <div>
                                <p className="font-black text-sm text-foreground">Jarvis Voice Assistant</p>
                                <p className="text-xs text-muted-foreground font-medium mt-0.5">Enable AI voice interaction (Hindi/English)</p>
                             </div>
                          </div>
                          <Switch
                            checked={appearance.reduceAnimations === false} // Placeholder for Jarvis toggle
                          />
                       </div>

                       <div className="flex items-center justify-between p-5 rounded-[2rem] bg-background/50 border border-border/20">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-muted-foreground" />
                             </div>
                             <div>
                                <p className="font-black text-sm text-foreground">Interface Language</p>
                                <p className="text-xs text-muted-foreground font-medium mt-0.5">Primary language for the platform</p>
                             </div>
                          </div>
                          <select className="bg-background border border-border/40 rounded-xl px-4 py-2 text-xs font-bold outline-none ring-primary/20 focus:ring-2">
                             <option value="en">English (Global)</option>
                             <option value="hi">Hindi (हिन्दी)</option>
                          </select>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40 rounded-[2rem] shadow-data bg-card/60 backdrop-blur-xl">
                  <CardContent className="p-8 space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Display Preferences</p>
                    {[
                      { id: "compactMode",       title: "Bento Compact Mode",       desc: "Denser dashboard grid for power users" },
                      { id: "reduceAnimations",  title: "Reduce Performance Motion",  desc: "Optimize for lower-end devices" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-5 rounded-[2rem] bg-background/50 border border-border/20 hover:border-purple-500/20 transition-all">
                        <div>
                          <p className="font-black text-sm text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.desc}</p>
                        </div>
                        <Switch
                          checked={appearance[item.id as keyof typeof appearance] as boolean}
                          onCheckedChange={(checked) => setAppearance(prev => ({ ...prev, [item.id]: checked }))}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
