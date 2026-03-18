"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { ChatAssistant } from "@/components/dashboard/chat-assistant"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

type Profile = {
  full_name: string | null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Skip check if already on setup page to avoid redirect loops
      if (pathname === "/dashboard/profile/setup") {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single<Profile>() // Proper type casting for select

      if (!profile || !profile.full_name) {
        router.push("/dashboard/profile/setup")
      } else {
        setLoading(false)
      }
    }

    checkProfile()
  }, [router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Verifying Profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 bg-dot-grid">
      <DashboardSidebar />
      <div className="lg:pl-[272px] transition-all duration-300">
        <DashboardHeader />
        <main className="p-4 lg:p-6 pb-28 lg:pb-8">{children}</main>
        <ChatAssistant />
      </div>
    </div>
  )
}
