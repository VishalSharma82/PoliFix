"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Bell,
  CheckCircle2,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
  Settings,
  Check,
  Trash2,
  MapPin,
  Loader2,
  Wifi,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type Notification = Database["public"]["Tables"]["notifications"]["Row"]

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  verified: { icon: ThumbsUp, color: "bg-primary", label: "Verified" },
  resolved: { icon: CheckCircle2, color: "bg-green-500", label: "Resolved" },
  comment: { icon: MessageCircle, color: "bg-blue-500", label: "Comment" },
  status: { icon: AlertTriangle, color: "bg-amber-500", label: "Status" },
  nearby: { icon: MapPin, color: "bg-accent", label: "Nearby" },
  system: { icon: Bell, color: "bg-muted-foreground", label: "System" },
}

const notificationSettings = [
  { id: "email_reports", label: "Report updates", description: "Get notified when your reports are verified or resolved", enabled: true },
  { id: "email_comments", label: "Comments", description: "Get notified when someone comments on your reports", enabled: true },
  { id: "email_weekly", label: "Weekly summary", description: "Receive a weekly summary of community activity", enabled: false },
  { id: "push_reports", label: "Push notifications", description: "Get instant push notifications for important updates", enabled: true },
]

function timeAgo(dateString: string): string {
  const ms = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(notificationSettings)
  const [filter, setFilter] = useState("all")
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      // Fetch initial notifications
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (data) setNotifs(data)
      setLoading(false)

      // Supabase realtime subscription
      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification
            setNotifs(prev => [newNotif, ...prev])
          }
        )
        .subscribe((status) => {
          setRealtimeConnected(status === 'SUBSCRIBED')
        })

      return () => { supabase.removeChannel(channel) }
    }
    init()
  }, [])

  const unreadCount = notifs.filter(n => !n.is_read).length

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAllAsRead() {
    if (!userId) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const filteredNotifs = filter === 'all' ? notifs
    : filter === 'unread' ? notifs.filter(n => !n.is_read)
    : notifs.filter(n => n.is_read)

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Loading Notifications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Notifications</h1>
            {realtimeConnected && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Live</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : "You're all caught up! 🎉"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" className="rounded-2xl font-bold gap-2" onClick={markAllAsRead}>
              <Check className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="rounded-2xl">
          <TabsTrigger value="notifications" className="relative rounded-xl">
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card className="border-border/40 shadow-xl rounded-[2rem] bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-6 pb-0">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-xl font-black tracking-tight">All Notifications</CardTitle>
                <div className="flex gap-2">
                  {['all', 'unread', 'read'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${filter === f ? 'bg-primary text-white border-primary' : 'border-border/40 text-muted-foreground hover:border-primary/40'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence>
                {filteredNotifs.length > 0 ? (
                  <div className="space-y-2">
                    {filteredNotifs.map((notification, index) => {
                      const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system
                      const Icon = config.icon
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.03 }}
                          className={`flex items-start gap-4 p-4 rounded-2xl transition-all group ${notification.is_read ? 'bg-transparent' : 'bg-primary/5 border border-primary/10'} hover:bg-muted/30`}
                        >
                          <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center shrink-0 shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>

                          <div className="flex-1 min-w-0" onClick={() => markAsRead(notification.id)}>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${config.color} bg-opacity-10 text-white`} style={{ backgroundColor: 'transparent', color: 'var(--foreground)' }}>
                                    {config.label}
                                  </span>
                                </div>
                                <p className="font-bold text-sm text-foreground mt-0.5">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notification.created_at)}</p>
                              </div>
                              {!notification.is_read && (
                                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.is_read && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => markAsRead(notification.id)}>
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-border/20 rounded-[1.5rem]">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <h3 className="font-black text-foreground uppercase tracking-widest text-sm">No notifications</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filter === "unread" ? "You've read all your notifications" : "You don't have any notifications yet"}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-border/40 shadow-xl rounded-[2rem] bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                <Settings className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-muted/30 border border-border/20">
                  <div>
                    <h3 className="font-black text-sm text-foreground">{setting.label}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{setting.description}</p>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                  />
                </div>
              ))}
              <div className="pt-4 border-t border-border/20">
                <Button className="w-full rounded-2xl font-bold h-12">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
