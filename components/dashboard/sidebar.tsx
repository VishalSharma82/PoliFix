"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  LayoutDashboard,
  Map,
  PlusCircle,
  Activity,
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronLeft,
  Menu,
  Trophy,
  BarChart2,
  Shield,
  X,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useSoundContext } from "@/components/providers/SoundProvider"

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/dashboard",            color: "text-indigo-500",   bg: "bg-indigo-500/10",   glow: "shadow-indigo-500/30" },
  { icon: Map,             label: "Map View",         href: "/dashboard/map",         color: "text-cyan-500",    bg: "bg-cyan-500/10",    glow: "shadow-cyan-500/30" },
  { icon: PlusCircle,      label: "Report Problem",   href: "/dashboard/report",      color: "text-rose-500",    bg: "bg-rose-500/10",    glow: "shadow-rose-500/30" },
  { icon: Activity,        label: "Activity Feed",    href: "/dashboard/activity",    color: "text-amber-500",   bg: "bg-amber-500/10",   glow: "shadow-amber-500/30" },
  { icon: Bell,            label: "Notifications",    href: "/dashboard/notifications",color: "text-violet-500", bg: "bg-violet-500/10",  glow: "shadow-violet-500/30" },
  { icon: Trophy,          label: "Leaderboard",      href: "/dashboard/leaderboard", color: "text-yellow-500",  bg: "bg-yellow-500/10",  glow: "shadow-yellow-500/30" },
  { icon: BarChart2,       label: "City Stats",       href: "/dashboard/city-stats",  color: "text-green-500",   bg: "bg-green-500/10",   glow: "shadow-green-500/30" },
  { icon: Shield,          label: "Authority Panel",  href: "/dashboard/authority",   color: "text-blue-500",    bg: "bg-blue-500/10",    glow: "shadow-blue-500/30" },
]

const bottomNavItems: any[] = [] // Removed as per user request (moved to Header)

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { play } = useSoundContext()

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => { setMobileOpen(true); play('slide') }}
        className="lg:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-11 h-11 bg-card glass border border-border/60 rounded-2xl shadow-premium transition-all hover:shadow-glow active:scale-95"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => { setMobileOpen(false); play('slide') }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 bg-background border-r border-border z-50 flex flex-col shadow-xl transition-all duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          mobileOpen && "w-[280px]!" 
        )}
      >
        {/* Logo Area */}
        <div className={cn("h-16 flex items-center justify-between border-b border-border shrink-0", collapsed ? "px-4" : "px-6")}>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 active:scale-95 transition-transform"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none">
                <span className="font-black text-lg text-foreground tracking-tight">PoliFix</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Hub</span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
               onClick={() => { setCollapsed(true); play('slide') }}
               className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
               <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {collapsed && (
             <button
                onClick={() => { setCollapsed(false); play('slide') }}
                className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
             >
                <Menu className="w-4 h-4" />
             </button>
          )}
          
          {/* Mobile close */}
          <button
              onClick={() => { setMobileOpen(false); play('slide') }}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
              <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Sections */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-6">
          {/* Operational Group */}
          <div className="px-3">
             {!collapsed && <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.25em] px-4 mb-3">Operations</p>}
             <div className="space-y-1">
                {mainNavItems.slice(0, 3).map((item) => (
                  <NavButton key={item.href} item={item} collapsed={collapsed} pathname={pathname} setMobileOpen={setMobileOpen} />
                ))}
             </div>
          </div>

          {/* Social Group */}
          <div className="px-3">
             {!collapsed && <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.25em] px-4 mb-3">Community</p>}
             <div className="space-y-1">
                {mainNavItems.slice(3).map((item) => (
                  <NavButton key={item.href} item={item} collapsed={collapsed} pathname={pathname} setMobileOpen={setMobileOpen} />
                ))}
             </div>
          </div>
        </div>

        {/* Compact Mode indicator or similar could go here */}
      </motion.aside>
    </>
  )
}

function NavButton({ item, collapsed, pathname, setMobileOpen }: any) {
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  
  return (
    <Link
      href={item.href}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : item.color || "")} />
      
      {!collapsed && (
        <span className={cn(
          "font-bold text-[11px] uppercase tracking-[0.15em] truncate transition-opacity duration-200",
          isActive ? "text-white" : ""
        )}>
          {item.label}
        </span>
      )}

      {/* Systematic Indicator */}
      {isActive && !collapsed && (
        <motion.div
           layoutId="navIndicator"
           className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
        />
      )}

      {/* Tooltip for collapsed mode */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] shadow-2xl">
          {item.label}
        </div>
      )}
    </Link>
  )
}
