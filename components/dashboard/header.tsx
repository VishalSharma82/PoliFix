"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  Settings, 
  LogOut, 
  MapPin, 
  Loader2, 
  X, 
  CheckCheck, 
  AlertCircle, 
  CheckCircle2,
  HelpCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { cn } from "@/lib/utils"
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

  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-[40] transition-all duration-300 lg:pl-[260px]">
        <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
             {/* Mobile Spacer (for menu button in sidebar) */}
             <div className="w-12 lg:hidden shrink-0" />

             {/* Page title */}
             <div className="hidden sm:block shrink-0 mr-4">
               <h1 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/70">{pageTitle}</h1>
             </div>

             {/* Search bar */}
             <div className="flex-1 max-w-md hidden md:block">
               <div className="relative group">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input
                   placeholder="Search resources, reports..."
                   className="pl-10 h-10 bg-muted/50 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl text-sm transition-all focus:bg-background"
                 />
               </div>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <SoundToggle />
            
            {/* Notifications */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground"
              >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-background animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50"
                  >
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      <button onClick={handleMarkAllRead} className="text-[10px] font-black uppercase text-primary tracking-widest hover:opacity-70">Clear All</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.map((n) => {
                        const { Icon, color, bg } = notificationIcon[n.type] || notificationIcon.info
                        return (
                          <div key={n.id} className={cn("px-5 py-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors", n.unread && "bg-primary/[0.03]")}>
                            <div className="flex gap-3">
                               <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
                                  <Icon className={cn("w-4 h-4", color)} />
                               </div>
                               <div className="flex-1 min-w-0 text-left">
                                  <p className="text-xs font-bold truncate leading-tight">{n.title}</p>
                                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{n.description}</p>
                                  <p className="text-[9px] text-muted-foreground/60 mt-2 font-bold uppercase tracking-widest">{n.time}</p>
                               </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
                className={cn(
                   "flex items-center gap-2 p-1 rounded-xl transition-all duration-200",
                   showProfile ? "bg-muted" : "hover:bg-muted"
                )}
              >
                <Avatar className="w-8 h-8 rounded-lg border border-border">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="object-cover w-full h-full" />
                  ) : (
                    <AvatarFallback className="bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showProfile && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-border bg-muted/30">
                       <p className="text-xs font-black truncate">{profile?.full_name || 'Citizen'}</p>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                          {profile?.reputation_points ? `Rep: ${profile.reputation_points}` : 'Standard Member'}
                       </p>
                    </div>
                    <div className="p-1.5">
                       {[
                         { Icon: User,       label: "Profile",     href: "/dashboard/profile" },
                         { Icon: Settings,   label: "Settings",    href: "/dashboard/settings" },
                         { Icon: HelpCircle, label: "Help Center", href: "/dashboard/help" },
                       ].map(({ Icon, label, href }) => (
                         <Link
                           key={href}
                           href={href}
                           className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                           onClick={() => setShowProfile(false)}
                         >
                           <Icon className="w-4 h-4" />
                           <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                         </Link>
                       ))}
                    </div>
                    <div className="p-1.5 border-t border-border">
                       <button
                         onClick={handleSignOut}
                         className="flex w-full items-center gap-3 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                       >
                         <LogOut className="w-4 h-4" />
                         <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search bar toggleable if needed */}
      <AnimatePresence>
        {showMobileSearch && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="fixed top-16 left-0 right-0 bg-background border-b border-border z-[35] px-4 py-3 lg:hidden"
           >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 h-10 rounded-xl" />
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
