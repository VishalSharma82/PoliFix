"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, User, ChevronDown, Settings, LogOut, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

const notifications = [
  { id: 1, title: "Your report was verified", description: "Pothole on Main St got 5 verifications", time: "2 min ago", unread: true },
  { id: 2, title: "Issue resolved!", description: "Broken streetlight on Oak Ave is now fixed", time: "1 hour ago", unread: true },
  { id: 3, title: "New comment", description: "John Doe commented on your report", time: "3 hours ago", unread: false },
]

export function DashboardHeader() {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <header className="h-16 bg-background border-b px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search problems, locations..."
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Quick report button */}
        <Button asChild size="sm" className="hidden sm:flex">
          <Link href="/dashboard/report">
            <MapPin className="w-4 h-4 mr-2" />
            Report Issue
          </Link>
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfile(false)
            }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-background rounded-xl border shadow-lg overflow-hidden z-50"
              >
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Notifications</h3>
                    <button className="text-sm text-primary hover:underline">Mark all read</button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${notification.unread ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {notification.unread && (
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        )}
                        <div className={notification.unread ? "" : "ml-5"}>
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t">
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/dashboard/notifications">View all notifications</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <Avatar className="w-8 h-8">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-primary text-white text-sm">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : userInitials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none truncate max-w-[100px]">
                {loading ? 'Loading...' : (profile?.full_name || 'User')}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.reputation_points ? `${profile.reputation_points} Points` : 'Citizen'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-background rounded-xl border shadow-lg overflow-hidden z-50"
              >
                <div className="p-4 border-b">
                  <p className="font-medium truncate">{profile?.full_name || 'Citizen'}</p>
                  <p className="text-sm text-muted-foreground truncate opacity-70">Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setShowProfile(false)}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">View Profile</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setShowProfile(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </div>
                <div className="p-2 border-t">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Log out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
