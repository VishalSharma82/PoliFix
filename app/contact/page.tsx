"use client"

import { motion } from "framer-motion"
import { LandingNav } from "@/components/landing/nav"
import { LandingFooter } from "@/components/landing/footer"
import { Mail, Phone, MessageSquare, Send, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Thank you! Your message has been sent.")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      
      <main className="pt-24">
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-7xl font-black mb-6 tracking-tighter"
              >
                Let's <span className="text-primary italic">Connect</span>
              </motion.h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions or feedback? We'd love to hear from you. 
                Our team is here to support your civic journey.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="grid gap-6">
                  {[
                    { icon: Mail, label: "Email Us", detail: "support@polifix.org", color: "bg-blue-500/10 text-blue-500" },
                    { icon: Phone, label: "Call Us", detail: "+91 98765 43210", color: "bg-green-500/10 text-green-500" },
                    { icon: MessageSquare, label: "Live Chat", detail: "Available 9am - 6pm", color: "bg-purple-500/10 text-purple-500" },
                    { icon: MapPin, label: "Headquarters", detail: "New Delhi, India", color: "bg-red-500/10 text-red-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-card border border-border/40 shadow-sm transition-all hover:shadow-premium group">
                      <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <item.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{item.label}</p>
                        <p className="text-xl font-black tracking-tight">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <form onSubmit={handleSubmit} className="p-10 md:p-12 rounded-[3rem] bg-card/50 backdrop-blur-xl border border-border/40 shadow-2xl space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Full Name</label>
                    <Input placeholder="John Doe" className="h-14 rounded-2xl bg-background/50 border-border/60 text-lg px-6" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Email Address</label>
                    <Input type="email" placeholder="john@example.com" className="h-14 rounded-2xl bg-background/50 border-border/60 text-lg px-6" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1">Message</label>
                    <Textarea placeholder="How can we help you today?" className="min-h-[160px] rounded-[2rem] bg-background/50 border-border/60 text-lg px-6 pt-6 resize-none" required />
                  </div>
                  <Button type="submit" size="lg" className="w-full h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-glow-sm hover:shadow-glow transition-all">
                    Send Message <Send className="ml-3 w-4 h-4" />
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
