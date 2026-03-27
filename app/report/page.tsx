"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function ReportRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Redirect to dashboard report form
        router.push("/dashboard?report=true")
      } else {
        // Redirect to auth page with return path
        router.push("/auth?next=/dashboard?report=true")
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
      <div className="p-10 rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-border/40 shadow-2xl flex flex-col items-center gap-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Initializing Report System...</p>
      </div>
    </div>
  )
}
