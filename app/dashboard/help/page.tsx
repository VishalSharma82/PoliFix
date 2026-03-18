"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  HelpCircle, MessageCircle, BookOpen, MapPin, AlertTriangle, CheckCircle2,
  ArrowRight, Mail, ExternalLink, Sparkles, Brain, Shield, BarChart2, Activity, Trophy
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const faqs = [
  {
    q: "How do I report a city infrastructure problem?",
    a: "Navigate to 'Report Problem' in the sidebar. Provide a title, description, category, and your GPS location. You can also upload a photo — our AI will auto-detect the problem type and severity for you.",
  },
  {
    q: "What happens after I report an issue?",
    a: "Your report is published on the live map. Other citizens can verify it, raising its priority score. Municipal authorities review high-priority issues and update the status from Reported → Verified → In Progress → Resolved.",
  },
  {
    q: "How does the AI Priority Engine work?",
    a: "Our AI analyzes each report based on 4 factors: severity, community confirmations, location importance (near schools/hospitals), and time pending. This generates a priority score visible on the map.",
  },
  {
    q: "What are reputation points?",
    a: "You earn points for civic actions: +10 for reporting, +5 for verifying, +20 when your report is resolved. Points unlock Civic Levels from 'Observer' to 'City Legend' on the leaderboard.",
  },
  {
    q: "How does the AI duplicate detection work?",
    a: "When you submit a new report, our AI compares it with existing nearby reports using semantic similarity. If a match is found (80%+ score), you'll be prompted to confirm the existing report instead.",
  },
  {
    q: "What does the AI Civic Chat Assistant do?",
    a: "The chat bubble in the bottom-right answers your questions about city issues in natural language. Try: \"Which area has most problems?\" or \"Show me unresolved potholes.\"",
  },
  {
    q: "How do I interpret the AI Prediction Heatmap?",
    a: "Toggle 'Future Risks' on the map to see predicted infrastructure failure zones (pink/indigo). Click any pulsing marker to see the AI's reasoning for why that area is at risk.",
  },
  {
    q: "I found a bug or have a feature request. How do I report it?",
    a: "Email us at support@polifix.app or use the feedback form below. We review all reports and use them to improve the platform.",
  },
]

const guides = [
  { icon: MapPin, title: "Using the Map", desc: "Switch between heatmaps, markers, and AI predictions.", href: "/dashboard/map", color: "bg-cyan-500/10 text-cyan-600" },
  { icon: AlertTriangle, title: "Reporting Issues", desc: "Upload photos, set location, and let AI do the rest.", href: "/dashboard/report", color: "bg-rose-500/10 text-rose-600" },
  { icon: Brain, title: "AI Features", desc: "Explore AI priority, predictions, and chat assistant.", href: "/dashboard", color: "bg-violet-500/10 text-violet-600" },
  { icon: Trophy, title: "Earning Points", desc: "Level up your civic rank through actions.", href: "/dashboard/leaderboard", color: "bg-amber-500/10 text-amber-600" },
  { icon: BarChart2, title: "City Stats", desc: "View resolution rates and community impact.", href: "/dashboard/city-stats", color: "bg-green-500/10 text-green-600" },
  { icon: Activity, title: "Activity Feed", desc: "See real-time community actions and verifications.", href: "/dashboard/activity", color: "bg-blue-500/10 text-blue-600" },
]

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
          <HelpCircle className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Help & Support</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">
          How can we help?
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Everything you need to get the most out of PoliFix — from reporting issues to understanding AI features.
        </p>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-xl font-black text-foreground mb-5 tracking-tight">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {guides.map((g, i) => (
            <motion.div key={g.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
              <Link href={g.href} className="group block p-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:bg-card transition-all">
                <div className={`w-10 h-10 rounded-xl ${g.color} flex items-center justify-center mb-3`}>
                  <g.icon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors">{g.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{g.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-primary text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground">Common questions answered</p>
          </div>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl hover:border-primary/30 transition-all">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-foreground mb-2">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact / AI Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest">AI-Powered Help</Badge>
              <h3 className="text-xl font-black text-foreground">Still have questions?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Ask the PoliFix AI Chat Assistant (bottom-right) any question about city issues, your reports, or platform features.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button className="rounded-xl gap-2 font-bold" asChild>
                <a href="mailto:support@polifix.app">
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
              </Button>
              <Button variant="outline" className="rounded-xl gap-2 font-bold border-primary/20" asChild>
                <Link href="/dashboard">
                  <MessageCircle className="w-4 h-4" />
                  Use AI Chat
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
