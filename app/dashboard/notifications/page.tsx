"use client"

import { useState } from "react"
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
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

const notifications = [
  {
    id: 1,
    type: "verification",
    title: "Your report was verified",
    description: "5 people verified your report 'Pothole on Main Street'",
    time: "2 minutes ago",
    read: false,
    icon: ThumbsUp,
    color: "bg-primary",
    link: "/dashboard/problem/1",
  },
  {
    id: 2,
    type: "resolved",
    title: "Issue resolved!",
    description: "The 'Broken streetlight on Oak Ave' has been fixed by City Works",
    time: "1 hour ago",
    read: false,
    icon: CheckCircle2,
    color: "bg-green-500",
    link: "/dashboard/problem/2",
  },
  {
    id: 3,
    type: "comment",
    title: "New comment on your report",
    description: "Sarah Chen commented: 'Thanks for reporting this!'",
    time: "3 hours ago",
    read: false,
    icon: MessageCircle,
    color: "bg-blue-500",
    link: "/dashboard/problem/1",
  },
  {
    id: 4,
    type: "status",
    title: "Status update",
    description: "Your report 'Water leak on Pine Road' is now in progress",
    time: "5 hours ago",
    read: true,
    icon: AlertTriangle,
    color: "bg-amber-500",
    link: "/dashboard/problem/4",
  },
  {
    id: 5,
    type: "verification",
    title: "Milestone reached!",
    description: "Your report reached 20 verifications",
    time: "1 day ago",
    read: true,
    icon: ThumbsUp,
    color: "bg-primary",
    link: "/dashboard/problem/1",
  },
  {
    id: 6,
    type: "system",
    title: "Weekly summary",
    description: "You helped resolve 3 issues this week. Great job!",
    time: "2 days ago",
    read: true,
    icon: Bell,
    color: "bg-muted-foreground",
    link: "/dashboard/profile",
  },
]

const notificationSettings = [
  { id: "email_reports", label: "Report updates", description: "Get notified when your reports are verified or resolved", enabled: true },
  { id: "email_comments", label: "Comments", description: "Get notified when someone comments on your reports", enabled: true },
  { id: "email_weekly", label: "Weekly summary", description: "Receive a weekly summary of community activity", enabled: false },
  { id: "push_reports", label: "Push notifications", description: "Get instant push notifications for important updates", enabled: true },
]

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications)
  const [settings, setSettings] = useState(notificationSettings)
  const [filter, setFilter] = useState("all")

  const unreadCount = notifs.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifs(notifs.filter((n) => n.id !== id))
  }

  const toggleSetting = (id: string) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  const filteredNotifs = filter === "all" ? notifs : filter === "unread" ? notifs.filter((n) => !n.read) : notifs.filter((n) => n.read)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications" className="relative">
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>All Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={filter === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === "unread" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("unread")}
                  >
                    Unread
                  </Button>
                  <Button
                    variant={filter === "read" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("read")}
                  >
                    Read
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {filteredNotifs.length > 0 ? (
                  <div className="space-y-2">
                    {filteredNotifs.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                          notification.read ? "bg-background" : "bg-primary/5"
                        } hover:bg-muted/50 group`}
                      >
                        <div className={`w-10 h-10 rounded-full ${notification.color} flex items-center justify-center shrink-0`}>
                          <notification.icon className="w-5 h-5 text-white" />
                        </div>

                        <Link href={notification.link} className="flex-1 min-w-0" onClick={() => markAsRead(notification.id)}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-medium text-sm ${notification.read ? "text-foreground" : "text-foreground"}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />
                            )}
                          </div>
                        </Link>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-1">No notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      {filter === "unread" ? "You've read all your notifications" : "You don't have any notifications yet"}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/50">
                  <div>
                    <h3 className="font-medium text-sm">{setting.label}</h3>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                  />
                </div>
              ))}

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
