"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, User, ChevronDown, Settings, LogOut, MapPin, Loader2, X, CheckCheck, AlertCircle, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { SoundToggle } from "@/components/ui/sound-toggle"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

const initialNotifications = [
  { id: 1, title: "Report Verified!", description: "Pothole on Main St received 5 community verifications.", time: "2 min ago", unread: true, type: "success" },
  { id: 2, title: "Issue Resolved 🎉", description: "Broken streetlight on Oak Ave has been fixed.", time: "1 hour ago", unread: true, type: "resolved" },
  { id: 3, title: "New Confirmation", description: "Someone confirmed your water leak report.", time: "3 hours ago", unread: false, type: "info" },
]

const notificationIcon: Record<string, any> = {
  success: { Icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  resolved: { Icon: CheckCheck, color: "text-primary", bg: "bg-primary/10" },
  info: { Icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
}

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState(initialNotifications)
  const searchRef = useRef<HTMLInputElement>(null)

  const hasUnread = notifications.some(n => n.unread)
  const unreadCount = notifications.filter(n => n.unread).length

  const handleMarkAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))

  useEffect(() => {
    if (showMobileSearch) searchRef.current?.focus()
  }, [showMobileSearch])

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = () => { setShowNotifications(false); setShowProfile(false) }
    if (showNotifications || showProfile) {
      setTimeout(() => document.addEventListener('click', handler))
      return () => document.removeEventListener('click', handler)
    }
  }, [showNotifications, showProfile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  // Get page title from pathname
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'

  return (
    <>
      <header className="h-[68px] glass-strong border-b border-border/50 px-4 lg:px-6 flex items-center gap-4 sticky top-0 z-[100]">
        {/* Page title (mobile) */}
        <div className="pl-12 lg:pl-0 flex-1 lg:flex-none">
          <p className="font-black text-base text-foreground capitalize lg:hidden">{pageTitle}</p>
        </div>

        {/* Desktop Search */}
        <div className="flex-1 max-w-sm hidden lg:block">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search city problems..."
              className="pl-10 h-10 bg-muted/40 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl text-sm transition-all focus:bg-card/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-9 h-9 rounded-xl"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search className="w-4.5 h-4.5" />
          </Button>

          {/* Quick report */}
          <Button asChild size="sm" className="hidden sm:flex h-9 rounded-xl gap-1.5 text-xs font-bold shadow-glow-sm hover:shadow-glow transition-all">
            <Link href="/dashboard/report">
              <MapPin className="w-3.5 h-3.5" />
              Report
            </Link>
          </Button>

          {/* Sound toggle */}
          <SoundToggle />

          {/* Notifications */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-4.5 h-4.5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-background" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full mt-3 w-80 sm:w-96 glass-strong rounded-3xl border border-border/50 shadow-2xl overflow-hidden z-50"
                >
                  <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-black text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">{unreadCount}</span>
                      )}
                    </div>
                    <button
                      className="text-xs font-bold text-primary hover:text-primary/70 transition-colors"
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto no-scrollbar">
                    {notifications.map((n) => {
                      const { Icon, color, bg } = notificationIcon[n.type] || notificationIcon.info
                      return (
                        <div
                          key={n.id}
                          className={`px-5 py-4 border-b border-border/20 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${n.unread ? 'bg-primary/3' : ''}`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <Icon className={`w-4.5 h-4.5 ${color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-bold leading-tight">{n.title}</p>
                                {n.unread && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{n.description}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-border/40">
                    <Button variant="ghost" size="sm" className="w-full rounded-xl text-xs font-bold" asChild>
                      <Link href="/dashboard/notifications">View all notifications →</Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl hover:bg-muted/50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="object-cover w-full h-full rounded-full" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white text-xs font-black">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : userInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black leading-none truncate max-w-[100px]">
                  {loading ? 'Loading...' : (profile?.full_name || 'Citizen')}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  {profile?.reputation_points ? `⭐ ${profile.reputation_points}pts` : 'City Member'}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground hidden sm:block transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full mt-3 w-64 glass-strong rounded-3xl border border-border/50 shadow-2xl overflow-hidden z-50"
                >
                  {/* Profile header */}
                  <div className="p-4 border-b border-border/40">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="object-cover w-full h-full rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-black text-base">
                            {userInitials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-black text-sm truncate">{profile?.full_name || 'Citizen'}</p>
                        <p className="text-xs text-muted-foreground">Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}</p>
                        {profile?.reputation_points && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-black">
                            ⭐ {profile.reputation_points} points
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    {[
                      { Icon: User, label: "View Profile", href: "/dashboard/profile" },
                      { Icon: Settings, label: "Settings", href: "/dashboard/settings" },
                    ].map(({ Icon, label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-muted/60 transition-colors group"
                        onClick={() => setShowProfile(false)}
                      >
                        <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-semibold">{label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="p-2 border-t border-border/40">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-destructive/10 text-destructive transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-strong border-b border-border/40 px-4 py-3 z-[99] sticky top-[68px]"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Search city problems..."
                className="pl-10 pr-10 h-10 rounded-xl bg-card/60 border-border/40 text-sm"
              />
              <button
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
