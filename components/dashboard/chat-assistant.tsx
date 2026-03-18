"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Brain, 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your **PoliFix AI Assistant**. I can help you analyze city issues, find hotspots, or explain why certain reports are prioritized. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const handleSend = async (text: string = message) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setMessage("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      })
      const data = await response.json()
      
      const assistantMsg: Message = { 
        role: "assistant", 
        content: data.data || "I'm sorry, I couldn't process that right now.", 
        timestamp: new Date() 
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      console.error("Chat Error:", error)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Oops! I'm having trouble connecting to the city data. Please try again later.", 
        timestamp: new Date() 
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: "Top hotspots?", icon: TrendingUp },
    { label: "Problems near me?", icon: MapPin },
    { label: "Unresolved issues?", icon: AlertTriangle },
  ]

  // Simple markdown renderer for bold and lists
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600">$1</strong>')
        .replace(/^\* (.*)/g, '<li class="ml-4 list-disc">$1</li>')
      
      return <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} className="min-h-[1.25rem]" />
    })
  }

  return (
    <div className="fixed bottom-8 right-8 z-[5000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-6"
          >
            <Card className="w-[400px] h-[600px] flex flex-col rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/20 bg-background/95 backdrop-blur-2xl overflow-hidden border">
              {/* Header */}
              <div className="p-6 bg-indigo-600 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight">Civic AI Assistant</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Live City Context</p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-xl relative z-10">
                  <ChevronDown className="w-6 h-6" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6 scroll-smooth">
                <div className="space-y-6">
                  {messages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === "user" 
                          ? "bg-indigo-600 text-white rounded-tr-none font-bold" 
                          : "bg-muted/50 border border-border/40 rounded-tl-none text-foreground font-medium"
                      }`}>
                        {renderContent(msg.content)}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted/50 border border-border/40 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Action Bar */}
              {!loading && messages.length < 4 && (
                <div className="px-6 pb-2 flex gap-2 flex-wrap">
                  {quickActions.map((action, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSend(action.label)}
                      className="rounded-full text-[10px] font-black uppercase border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all h-8"
                    >
                      <action.icon className="w-3 h-3 mr-1.5" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-6 border-t border-border/20 bg-background/50">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend() }}
                  className="flex gap-3"
                >
                  <Input 
                    placeholder="Ask about city infrastructure..." 
                    className="h-14 rounded-2xl border-border/40 bg-background px-6 font-medium shadow-inner focus:ring-indigo-500/20"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button size="icon" className="h-14 w-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 shrink-0 hover:bg-indigo-700">
                    <Send className="w-6 h-6" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all relative ${
          isOpen ? "bg-background text-foreground border border-border/40" : "bg-indigo-600 text-white shadow-indigo-500/40"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} key="close">
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} key="chat" className="relative">
              <MessageCircle className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-indigo-600 flex items-center justify-center animate-bounce shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
