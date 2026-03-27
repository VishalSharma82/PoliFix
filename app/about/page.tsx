"use client"

import { motion } from "framer-motion"
import { LandingNav } from "@/components/landing/nav"
import { LandingFooter } from "@/components/landing/footer"
import { MapPin, Users, Globe, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-30" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
            >
              Building Better <span className="text-primary">Cities</span> Together
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              PoliFix is a community-driven platform empowering citizens to report, 
              verify, and track infrastructure issues in real-time.
            </motion.p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-black mb-8 tracking-tight">Our Mission</h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Infrastructure is the backbone of our daily lives. From the roads we drive 
                    on to the streetlights that keep us safe at night, quality public works 
                    matter.
                  </p>
                  <p>
                    Yet, traditional reporting systems are often opaque and slow. PoliFix was 
                    born from the idea that technology can bridge the gap between citizens 
                    and local authorities.
                  </p>
                  <p>
                    We provide a transparent, AI-powered platform where every report counts and 
                    every city improvement is celebrated.
                  </p>
                </div>
              </motion.div>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: MapPin, label: "Precise Mapping", color: "text-blue-500" },
                  { icon: Users, label: "Community Driven", color: "text-green-500" },
                  { icon: Globe, label: "Open Data", color: "text-purple-500" },
                  { icon: Shield, label: "Verified Reports", color: "text-red-500" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-3xl bg-card border border-border/40 shadow-premium flex flex-col items-center text-center gap-4"
                  >
                    <item.icon className={`w-10 h-10 ${item.color}`} />
                    <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl font-black mb-12 tracking-tight">How It Started</h2>
            <div className="relative aspect-square max-w-xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl mb-12 border border-border/20 group">
              <img 
                src="/images/vishal-sharma.jpg" 
                alt="Vishal Sharma - Founder of PoliFix" 
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <p className="text-white font-bold text-lg">Vishal Sharma - Founder of PoliFix</p>
              </div>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              What started as a small hackathon project has grown into a movement. 
              Today, PoliFix helps thousands of citizens across multiple cities 
              take ownership of their environment.
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
