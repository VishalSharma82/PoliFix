"use client"

import { motion } from "framer-motion"
import { LandingNav } from "@/components/landing/nav"
import { LandingFooter } from "@/components/landing/footer"

export default function CookiesPage() {
  const sections = [
    {
      title: "What are Cookies?",
      content: "Cookies are small text files stored on your device that help us provide a better experience by remembering your preferences and session state."
    },
    {
      title: "Essential Cookies",
      content: "These cookies are strictly necessary for the platform to function, including authentication and security features."
    },
    {
      title: "Analytics Cookies",
      content: "We use Vercel Analytics to understand how our platform is used and where we can improve the user experience."
    },
    {
        title: "Managing Cookies",
        content: "You can manage or disable cookies through your browser settings, though some parts of PoliFix may not function correctly without them."
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
            <h1 className="text-5xl font-black mb-4 tracking-tighter">Cookie Policy</h1>
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
