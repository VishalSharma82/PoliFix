"use client"

import { motion } from "framer-motion"
import { LandingNav } from "@/components/landing/nav"
import { LandingFooter } from "@/components/landing/footer"
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const jobs = [
  {
    title: "Full Stack Engineer",
    type: "Full-time",
    location: "Remote / New Delhi",
    salary: "₹18L - ₹25L",
  },
  {
    title: "Product Designer",
    type: "Full-time",
    location: "Remote",
    salary: "₹15L - ₹22L",
  },
  {
    title: "Community Manager",
    type: "Part-time",
    location: "Mumbai",
    salary: "₹8L - ₹12L",
  }
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      
      <main className="pt-24">
        <section className="py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] -z-10 rounded-full translate-x-1/2" />
          <div className="container mx-auto px-4 text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl md:text-8xl font-black mb-8 tracking-tighter"
            >
              Join the <span className="text-primary italic">Movement</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              We're a team of dreamers and doers building the future of civic technology. 
              Help us empower citizens and transform cities.
            </motion.p>
          </div>

          <div className="container mx-auto px-4 max-w-5xl">
            <div className="bg-card/50 backdrop-blur-xl rounded-[3rem] border border-border/40 p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-12 tracking-tight flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                    <Briefcase className="w-6 h-6" />
                </div>
                Open Positions
              </h2>
              
              <div className="space-y-6">
                {jobs.map((job, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-8 rounded-3xl bg-background border border-border/40 hover:border-primary/40 hover:shadow-premium transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div>
                      <h3 className="text-2xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {job.type}</span>
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {job.location}</span>
                        <span className="text-foreground/60">{job.salary}</span>
                      </div>
                    </div>
                    <Button size="lg" className="rounded-2xl font-black text-xs uppercase tracking-widest h-14 px-8">
                      Apply Now <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-16 p-10 rounded-[2.5rem] bg-primary text-primary-foreground text-center">
                <h3 className="text-3xl font-black mb-4 tracking-tighter">Don't see a fit?</h3>
                <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                    We're always looking for talented individuals who are passionate about civic tech. 
                    Send us your CV anyway!
                </p>
                <Button variant="secondary" size="lg" className="rounded-2xl font-black text-xs uppercase tracking-widest h-14 px-10">
                    Join Talent Pool
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
