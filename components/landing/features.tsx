"use client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Users, LineChart, MapPin, Camera, Shield } from "lucide-react"

const features = [
  {
    icon: AlertTriangle,
    title: "Report Issues",
    description: "Quickly report infrastructure problems with photos and precise location data. Help identify issues that need attention.",
    color: "bg-critical/10 text-critical",
  },
  {
    icon: Users,
    title: "Verify Problems",
    description: "Confirm issues reported by fellow citizens. Community verification helps prioritize urgent problems.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: LineChart,
    title: "Track Solutions",
    description: "Follow the progress of reported issues from submission to resolution. Stay informed every step of the way.",
    color: "bg-success/10 text-success",
  },
]

const additionalFeatures = [
  {
    icon: MapPin,
    title: "Interactive Mapping",
    description: "Visual map interface with real-time problem markers and heat zones.",
  },
  {
    icon: Camera,
    title: "Photo Evidence",
    description: "Upload images to document issues and help officials understand problems.",
  },
  {
    icon: Shield,
    title: "Verified Reports",
    description: "Community-verified reports ensure accuracy and priority handling.",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background blur */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] -z-10" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary">Core Platform</Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6">
            Everything you need to <span className="text-primary">improve your city</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            A comprehensive platform that connects citizens with local authorities to solve
            infrastructure problems efficiently.
          </p>
        </motion.div>

        {/* Main features */}
        <div className="grid gap-8 md:grid-cols-3 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className="group relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2"
              >
                <CardContent className="p-8">
                  <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.color} transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-lg`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{feature.description}</p>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional features grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-[32px] border border-border/60 bg-card/40 backdrop-blur-md p-10 lg:p-16 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle glow */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] -z-10" />

          <div className="grid gap-12 md:grid-cols-3">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex gap-6 items-start"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
