"use client"

import { motion } from "framer-motion"
import { LandingNav } from "@/components/landing/nav"
import { LandingFooter } from "@/components/landing/footer"
import { Calendar, User, ArrowRight } from "lucide-react"
import Link from "next/link"

const posts = [
  {
    title: "How AI is changing city maintenance",
    excerpt: "Discover how machine learning algorithms are helping cities predict pothole formation before they happen.",
    date: "March 20, 2026",
    author: "Vishal Sharma",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "10 success stories from PoliFix users",
    excerpt: "From fixed streetlights to cleared parks, see how citizens are making a tangible impact in their neighborhoods.",
    date: "March 15, 2026",
    author: "Aditi Singh",
    category: "Community",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "The future of smart cities and civic tech",
    excerpt: "An exploration of the upcoming trends in urban planning and how citizens can participate in shaping their cities.",
    date: "March 10, 2026",
    author: "Rahul Varma",
    category: "Future",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop"
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      
      <main className="pt-24">
        <section className="py-20">
          <div className="container mx-auto px-4 text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black mb-6 tracking-tighter"
            >
              Our <span className="text-primary">Blog</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Latest news, urban insights, and community highlights from the world of PoliFix.
            </motion.p>
          </div>

          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 shadow-xl border border-border/40">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-border/40">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-border/20">
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <User className="w-3.5 h-3.5 text-primary" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {post.date}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
