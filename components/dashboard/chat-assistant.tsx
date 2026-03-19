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
  ChevronDown,
  Minimize2,
  Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your **PoliFix AI Assistant**. I can help you analyze city issues, find hotspots, or explain why certain reports are prioritized. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized])

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

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600">$1</strong>')
        .replace(/^\* (.*)/g, '<li class="ml-4 list-disc">$1</li>')
      
      return <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} className="min-h-[1.25rem]" />
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, transformOrigin: "bottom right" }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "72px" : "min(680px, 85vh)"
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "pointer-events-auto transition-all duration-300 ease-in-out",
              "w-[min(420px,92vw)] shadow-premium rounded-[2.5rem] overflow-hidden glass-strong"
            )}
          >
            {/* Header */}
            <div className={cn(
              "p-5 flex items-center justify-between transition-all group",
              isMinimized ? "bg-transparent" : "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-border/10"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-glow-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground tracking-tight">PoliFix Assistant</h3>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">AI Hub Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMinimized(!isMinimized)} 
                  className="rounded-xl h-8 w-8 hover:bg-white/20 text-muted-foreground hover:text-foreground"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)} 
                  className="rounded-xl h-8 w-8 hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-[calc(100%-80px)]"
                >
                  {/* Messages */}
                  <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-6">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex flex-col gap-1.5",
                            msg.role === "user" ? "items-end" : "items-start"
                          )}
                        >
                          <div className={cn(
                            "max-w-[85%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                            msg.role === "user" 
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none font-bold" 
                              : "glass bg-white/40 dark:bg-white/5 border border-white/10 rounded-tl-none font-medium text-foreground"
                          )}>
                            {renderContent(msg.content)}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 px-1">
                            {msg.role === "user" ? "You" : "PoliFix AI"} · {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex items-start gap-2">
                           <div className="glass bg-white/40 dark:bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-3 items-center">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Analyzing City Data...</span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Footer (Quick Actions + Input) */}
                  <div className="p-5 space-y-4">
                    {!loading && messages.length < 5 && (
                      <div className="flex gap-2 flex-wrap pb-2">
                        {quickActions.map((action, i) => (
                          <motion.button 
                            key={i}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSend(action.label)}
                            className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 border border-blue-500/10 hover:bg-blue-500/20 transition-all flex items-center gap-1.5"
                          >
                            <action.icon className="w-3 h-3" />
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSend() }}
                      className="flex gap-2 relative bg-background/50 p-1.5 rounded-[1.5rem] border border-border/20 shadow-inner"
                    >
                      <Input 
                        placeholder="Ask anything..." 
                        className="bg-transparent border-none shadow-none focus-visible:ring-0 text-sm font-medium h-11 px-4"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <Button size="icon" className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-glow-sm shrink-0 hover:scale-105 transition-all">
                        <Send className="w-4.5 h-4.5" />
                      </Button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isOpen && isMinimized) setIsMinimized(false)
          else setIsOpen(!isOpen)
        }}
        className={cn(
          "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-data transition-all pointer-events-auto",
          isOpen && !isMinimized 
            ? "bg-destructive text-white scale-90" 
            : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-glow"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized ? (
            <motion.div initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} key="close">
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key="closed" className="relative">
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
