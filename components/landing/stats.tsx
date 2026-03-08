"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView, useSpring, useTransform } from "framer-motion"
import { AlertCircle, CheckCircle2, Users, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    icon: AlertCircle,
    value: 12847,
    label: "Problems Reported",
    suffix: "",
    color: "text-critical",
    bgColor: "bg-critical/10",
  },
  {
    icon: CheckCircle2,
    value: 8934,
    label: "Problems Verified",
    suffix: "",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: TrendingUp,
    value: 6521,
    label: "Problems Resolved",
    suffix: "",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Users,
    value: 24500,
    label: "Active Citizens",
    suffix: "+",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 100,
    damping: 30,
  })

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, value, spring])

  const displayValue = useTransform(spring, (current) =>
    Math.round(current).toLocaleString() + suffix
  )

  return (
    <motion.span ref={ref}>
      {displayValue}
    </motion.span>
  )
}

export function LandingStats() {
  return (
    <section id="impact" className="py-24 lg:py-32 bg-foreground text-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <Badge variant="outline" className="mb-4 border-background/20 text-background/80">Real-time Impact</Badge>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
            Making real impact in <span className="text-primary italic">communities</span>
          </h2>
          <p className="text-xl opacity-70 leading-relaxed">
            Every report, verification, and resolution brings us closer to better cities.
            Join thousands of citizens actively improving their neighborhoods.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-24">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-[2rem] bg-background/5 border border-background/10 backdrop-blur-md p-10 text-center transition-all hover:bg-background/10 hover:border-background/20"
            >
              <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${stat.bgColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-xl`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <p className="text-5xl font-black mb-3 tracking-tighter">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm font-bold opacity-60 uppercase tracking-widest">{stat.label}</p>

              {/* Decorative line */}
              <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full ${stat.bgColor.replace('/10', '/30')} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>

        {/* Environmental impact - Premium redesign */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-[2.5rem] border border-background/10 bg-gradient-to-br from-background/10 to-transparent backdrop-blur-xl p-10 lg:p-20 shadow-2xl"
        >
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="max-w-md">
              <Badge className="bg-success text-success-foreground mb-6">Environmental Focus</Badge>
              <h3 className="text-3xl font-extrabold mb-6 leading-tight">Better Infrastructure, Better Environment.</h3>
              <p className="text-lg opacity-70 mb-10 leading-relaxed">
                Sustainability is at our core. By resolving infrastructure waste and optimizing mapping,
                we directly reduce the carbon footprint of our urban spaces.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-2xl bg-background/10 p-6 border border-background/5">
                  <p className="text-3xl font-black text-success tracking-tighter">2,340</p>
                  <p className="text-xs font-bold opacity-60 uppercase mt-2 tracking-wide">Garbage Issues Fixed</p>
                </div>
                <div className="rounded-2xl bg-background/10 p-6 border border-background/5">
                  <p className="text-3xl font-black text-success tracking-tighter">45t</p>
                  <p className="text-xs font-bold opacity-60 uppercase mt-2 tracking-wide">Waste Diverted</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {[
                { label: "Water Leaks Fixed", value: 156, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/20" },
                { label: "Lights Repaired", value: 892, icon: TrendingUp, color: "text-accent", bg: "bg-accent/20" },
                { label: "Potholes Filled", value: "1,2k", icon: AlertCircle, color: "text-moderate", bg: "bg-moderate/20" },
                { label: "Community Events", value: 423, icon: Users, color: "text-critical", bg: "bg-critical/20" }
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-3xl ${item.bg} p-8 text-center flex flex-col items-center gap-4 transition-all hover:shadow-2xl hover:shadow-background/5`}
                >
                  <div className={`h-12 w-12 rounded-full bg-background/20 flex items-center justify-center ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className={`text-4xl font-black ${item.color} tracking-tighter`}>{item.value}</p>
                    <p className="text-[10px] font-black uppercase opacity-60 mt-2 tracking-widest">{item.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
