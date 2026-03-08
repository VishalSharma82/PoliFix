"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Trash2,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

const stats = [
  { label: "Total Reports", value: "1,247", change: "+12.5%", trend: "up", icon: MapPin, color: "bg-primary" },
  { label: "Active Users", value: "3,842", change: "+8.2%", trend: "up", icon: Users, color: "bg-blue-500" },
  { label: "Resolved", value: "892", change: "+15.3%", trend: "up", icon: CheckCircle2, color: "bg-green-500" },
  { label: "Pending Review", value: "67", change: "-5.1%", trend: "down", icon: Clock, color: "bg-amber-500" },
]

const recentReports = [
  { id: 1, title: "Large pothole on Main St", user: "Sarah Chen", status: "pending", priority: "high", time: "2 min ago" },
  { id: 2, title: "Broken streetlight", user: "Mike Johnson", status: "in-review", priority: "medium", time: "15 min ago" },
  { id: 3, title: "Graffiti removal needed", user: "Emily Davis", status: "assigned", priority: "low", time: "1 hour ago" },
  { id: 4, title: "Water leak on Pine Road", user: "John Smith", status: "pending", priority: "high", time: "2 hours ago" },
  { id: 5, title: "Fallen tree branch", user: "Lisa Wang", status: "in-review", priority: "medium", time: "3 hours ago" },
]

const topReporters = [
  { name: "Sarah Chen", reports: 45, resolved: 38, avatar: "SC" },
  { name: "Mike Johnson", reports: 38, resolved: 32, avatar: "MJ" },
  { name: "Emily Davis", reports: 32, resolved: 28, avatar: "ED" },
  { name: "John Smith", reports: 28, resolved: 22, avatar: "JS" },
]

const categoryStats = [
  { name: "Roads & Potholes", count: 456, percentage: 36 },
  { name: "Street Lighting", count: 312, percentage: 25 },
  { name: "Sanitation", count: 234, percentage: 19 },
  { name: "Utilities", count: 156, percentage: 12 },
  { name: "Other", count: 89, percentage: 8 },
]

const statusColors: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  "in-review": "bg-amber-500/10 text-amber-600",
  assigned: "bg-blue-500/10 text-blue-600",
  resolved: "bg-green-500/10 text-green-600",
}

const priorityColors: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of all platform activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                    {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Reports</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/reports">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full ${priorityColors[report.priority]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-sm text-foreground truncate">
                            {report.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            by {report.user} · {report.time}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColors[report.status]}`}>
                          {report.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top reporters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topReporters.map((user, index) => (
                <div key={user.name} className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? "bg-amber-400" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-slate-500"}`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.reports} reports · {user.resolved} resolved</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reports by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {categoryStats.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{category.name}</span>
                    <span className="text-muted-foreground">{category.count}</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">{category.percentage}% of total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <span className="text-sm">Review Pending</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm">View Map</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
