"use client"

import { motion } from "framer-motion"
import { LandingNav } from "@/components/landing/nav"
import { LandingFooter } from "@/components/landing/footer"

export default function PrivacyPage() {
  const sections = [
    {
      title: "Data Collection",
      content: "We collect information you provide directly to us when you create an account, report a problem, or communicate with us. This includes your name, email address, and location data related to reports."
    },
    {
      title: "How We Use Your Data",
      content: "We use the information we collect to provide, maintain, and improve our services, including to precisely map infrastructure issues and notify authorities or community members."
    },
    {
      title: "Information Sharing",
      content: "Public reports (including descriptions, photos, and location) are visible to all users. Your personal contact information is never shared with third parties without your explicit consent."
    },
    {
        title: "Security",
        content: "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction."
      }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-5xl font-black mb-4 tracking-tighter">Privacy Policy</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Last Updated: March 2026</p>
          </motion.div>

          <div className="space-y-12">
            {sections.map((section, i) => (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="prose prose-slate dark:prose-invert max-w-none bg-card/30 p-8 md:p-12 rounded-[2.5rem] border border-border/40"
              >
                <h2 className="text-2xl font-black mb-6 tracking-tight">{section.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.section>
            ))}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
