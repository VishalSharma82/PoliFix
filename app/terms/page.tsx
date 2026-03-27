"use client"

import { motion } from "framer-motion"
import { LandingNav } from "@/components/landing/nav"
import { LandingFooter } from "@/components/landing/footer"

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing or using PoliFix, you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform."
    },
    {
      title: "User Responsibilities",
      content: "You are responsible for the accuracy of the reports you submit. False reporting or misuse of the platform may lead to account suspension."
    },
    {
      title: "Content Ownership",
      content: "By submitting reports, you grant PoliFix a license to use, display, and distribute the content for the purpose of improving civic infrastructure."
    },
    {
        title: "Termination",
        content: "We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever."
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
            <h1 className="text-5xl font-black mb-4 tracking-tighter">Terms of Service</h1>
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
