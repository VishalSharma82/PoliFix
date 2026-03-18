"use client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle, Users, LineChart, MapPin, Camera, Shield,
  Brain, Sparkles, TrendingUp, MessageSquare
} from "lucide-react"

const features = [
  {
    icon: AlertTriangle,
    title: "Report Issues",
    description: "Quickly report infrastructure problems with photos and precise GPS location. AI auto-detects category and severity from your image.",
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10 border-red-500/20",
    badge: "AI Powered",
    badgeColor: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  {
    icon: Users,
    title: "Verify & Confirm",
    description: "Community verification raises issue priority. AI smart spam detection prevents duplicates, keeping city data accurate and trustworthy.",
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    badge: "Spam Shield",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    icon: LineChart,
    title: "Track Solutions",
    description: "Follow issues from submission to resolution with real-time status updates, AI priority scoring, and full resolution history.",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10 border-green-500/20",
    badge: "Live Updates",
    badgeColor: "bg-green-500/10 text-green-600 border-green-500/20",
  },
]

const aiFeatures = [
  {
    icon: Brain,
    title: "AI Priority Engine",
    description: "Scores every issue using severity, confirmations, location criticality, and time pending.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    icon: TrendingUp,
    title: "Infrastructure Predictions",
    description: "Predicts future failure zones using cluster analysis before problems escalate.",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
  {
    icon: MessageSquare,
    title: "Civic Chat Assistant",
    description: "Ask \"Which area has most issues?\" and get real-time AI-powered answers.",
    gradient: "from-sky-500/20 to-cyan-500/20",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-500",
  },
  {
    icon: MapPin,
    title: "Interactive Heatmap",
    description: "Visualize current issues and predicted risk zones on a multi-layer live map.",
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Camera,
    title: "Photo AI Analysis",
    description: "Upload an image and AI instantly identifies the type and severity of the issue.",
    gradient: "from-teal-500/20 to-green-500/20",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-500",
  },
  {
    icon: Shield,
    title: "Authority Portal",
    description: "Municipal officials get a dedicated panel to manage, track, and resolve city issues.",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-secondary/20" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-accent/5 blur-[100px] -z-10" />
      <div className="absolute inset-0 bg-dot-grid opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary px-4 py-1.5 text-sm font-semibold rounded-full inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Platform
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6 leading-[1.1]">
            Everything you need to{" "}
            <span className="gradient-text">fix your city</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A next-generation civic platform that uses artificial intelligence to connect citizens
            with local authorities and solve infrastructure problems at scale.
          </p>
        </motion.div>

        {/* Core Features */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              whileHover={{ y: -6 }}
            >
              <Card className="group relative h-full overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/8 transition-all duration-500 cursor-default">
                {/* Top gradient bar */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

                <CardContent className="relative p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${feature.iconBg} transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-lg`}>
                      <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest ${feature.badgeColor} border rounded-xl px-2 py-1`}>
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-violet-500/30 bg-violet-500/5 text-violet-600 px-4 py-1.5 text-sm font-semibold rounded-full inline-flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" />
              5 AI Features Built In
            </Badge>
            <h3 className="text-2xl font-bold text-foreground">Next-Level Intelligence</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                whileHover={{ x: 4, scale: 1.02 }}
                className={`group flex gap-5 items-start p-6 rounded-2xl border border-border/40 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm hover:border-border/70 transition-all duration-300 cursor-default`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.iconBg} shadow-inner`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
