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

const bottomNavItems = [
  { icon: User,       label: "Profile",     href: "/dashboard/profile",  color: "text-primary" },
  { icon: Settings,   label: "Settings",    href: "/dashboard/settings", color: "text-muted-foreground" },
  { icon: HelpCircle, label: "Help Center", href: "/dashboard/help",     color: "text-muted-foreground" },
]

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
        animate={{ width: collapsed ? 80 : 272 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 h-full glass-strong border-r border-border/60 z-50 flex flex-col shadow-premium overflow-hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ width: collapsed ? 80 : 272 }}
      >
        {/* Logo */}
        <div className={cn("h-18 flex items-center justify-between border-b border-border/40 shrink-0", collapsed ? "px-5 py-4" : "px-5 py-4")}>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="relative w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-glow-sm transition-all group-hover:shadow-glow group-hover:scale-105">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-lg text-foreground tracking-tight">PoliFix</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">AI Civic Platform</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <div className="flex items-center gap-1">
            {/* Mobile close */}
            <button
              onClick={() => { setMobileOpen(false); play('slide') }}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Desktop collapse */}
            <button
              onClick={() => { setCollapsed(!collapsed); play('slide') }}
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            >
              <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", collapsed && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
          {mainNavItems.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {/* Colored icon wrapper (visible when not active) */}
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                  isActive ? "bg-white/20" : `${item.bg}`
                )}>
                  <item.icon className={cn("w-4 h-4", isActive ? "text-white" : item.color)} />
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn("font-semibold text-sm truncate", isActive ? "text-white" : "")}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/60 rounded-full"
                  />
                )}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* "Quick Report" CTA */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-3 mb-2"
          >
            <Link
              href="/dashboard/report"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 justify-center w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-sm shadow-glow-sm hover:shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4" />
              Quick Report
            </Link>
          </motion.div>
        )}

        {/* Bottom navigation */}
        <div className="p-3 border-t border-border/40 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", isActive ? "bg-white/20" : "bg-muted/60")}>
                  <item.icon className={cn("w-4 h-4", isActive ? "text-white" : item.color)} />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-semibold text-sm">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                  </div>
                )}
              </Link>
            )
          })}

          {/* Logout */}
          <Link
            href="/"
            className="group relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-muted/60 group-hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-semibold text-sm">
                  Log out
                </motion.span>
              )}
            </AnimatePresence>
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                Log out
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
              </div>
            )}
          </Link>
        </div>
      </motion.aside>
    </>
  )
}
