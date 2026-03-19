"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { ChatAssistant } from "@/components/dashboard/chat-assistant"
import { JarvisAssistant } from "@/components/dashboard/jarvis-assistant"
import { supabase } from "@/lib/supabase"
import { Loader2, LayoutDashboard, Map, PlusCircle, Activity, Bell, Plus } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Profile = {
  full_name: string | null
}

// Mobile nav items removed as per user request to use sidebar exclusively

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      if (pathname === "/dashboard/profile/setup") {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single<Profile>()

      if (!profile || !profile.full_name) {
        router.push("/dashboard/profile/setup")
      } else {
        setProfile(profile)
        setLoading(false)
      }
    }

    checkProfile()
  }, [router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-glow animate-pulse">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Verifying Profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 bg-dot-grid flex flex-col">
      <DashboardSidebar />
      <DashboardHeader />
      <div className="flex-1 lg:pl-[260px] pt-16 transition-all duration-300">
        <main className="p-4 lg:p-8 min-h-[calc(100vh-64px)]">
          {children}
        </main>
        <ChatAssistant />
        <JarvisAssistant userName={profile?.full_name || "Citizen"} />
      </div>

      {/* Mobile Bottom Navigation removed */}
    </div>
  )
}
