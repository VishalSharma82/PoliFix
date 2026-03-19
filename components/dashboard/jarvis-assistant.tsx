"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  X,
  Zap,
  Globe,
  Loader2,
  Brain
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface JarvisAssistantProps {
  userName?: string
}

export function JarvisAssistant({ userName = "Citizen" }: JarvisAssistantProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lang, setLang] = useState<"en-US" | "hi-IN">("en-US")
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const welcomeTriggered = useRef(false)

  // Initialize Speech Services & Load Preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem("polifix_preferences")
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs)
      if (parsed.appearance?.language) {
        setLang(parsed.appearance.language === "hi" ? "hi-IN" : "en-US")
      }
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = lang

        recognitionRef.current.onresult = (event: any) => {
          const current = event.results[event.results.length - 1][0].transcript
          setTranscript(current)
          if (event.results[0].isFinal) {
            handleCommand(current.toLowerCase())
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      synthRef.current = window.speechSynthesis
    }
  }, [lang])

  // Navigation & Command Logic
  const handleCommand = useCallback((text: string) => {
    console.log("Jarvis processing:", text)

    // Action Map (English & Hindi)
    const commands: Record<string, () => void> = {
      // English
      "map": () => { speak("Opening city map."); router.push("/dashboard/map") },
      "dashboard": () => { speak("Heading home."); router.push("/dashboard") },
      "home": () => { speak("Heading home."); router.push("/dashboard") },
      "report": () => { speak("Let's report a new problem."); router.push("/dashboard/report") },
      "profile": () => { speak("Opening your profile."); router.push("/dashboard/profile") },
      "settings": () => { speak("Opening settings."); router.push("/dashboard/settings") },
      "activity": () => { speak("Checking recent activity."); router.push("/dashboard/activity") },
      "notifications": () => { speak("Checking your alerts."); router.push("/dashboard/notifications") },
      "help": () => { speak("Opening help center."); router.push("/dashboard/help") },
      
      // Hindi
      "naksha": () => { speak("Naksha khol raha hoon."); router.push("/dashboard/map") },
      "shuru": () => { speak("Dashboard par jaa rahe hain."); router.push("/dashboard") },
      "shikayat": () => { speak("Nayi shikayat report karte hain."); router.push("/dashboard/report") },
      "badlav": () => { speak("Settings khol raha hoon."); router.push("/dashboard/settings") },
      "gati-vidhi": () => { speak("Activity dekh rahe hain."); router.push("/dashboard/activity") },
      "suchna": () => { speak("Alerts check karte hain."); router.push("/dashboard/notifications") },
      "madad": () => { speak("Help center khol raha hoon."); router.push("/dashboard/help") },
    }

    // Check for exact matches or partials
    let executed = false
    Object.keys(commands).forEach(cmd => {
      if (text.includes(cmd)) {
        commands[cmd]()
        executed = true
      }
    })

    if (!executed) {
      if (text.trim()) {
        getAIResponse(text)
      }
    }
  }, [router, lang])

  const speak = (text: string) => {
    if (!synthRef.current) return
    
    // Stop any current speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    
    // Try to find a good voice
    const voices = synthRef.current.getVoices()
    if (lang === "en-US") {
      const jarvisVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Guy") || v.name.includes("Male"))
      if (jarvisVoice) utterance.voice = jarvisVoice
    } else {
      const hindiVoice = voices.find(v => v.lang.includes("hi") || v.name.includes("Google Hindi"))
      if (hindiVoice) utterance.voice = hindiVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    synthRef.current.speak(utterance)
  }

  const getAIResponse = async (text: string) => {
    setResponse("Jarvis is thinking...")
    try {
      const res = await fetch("http://localhost:5000/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text,
          system_prompt: `You are Jarvis, a professional and helpful AI assistant for the PoliFix civic platform. 
          Keep your responses concise, intelligent, and slightly futuristic. 
          You can help navigate the site (Map, Report, Dashboard, Settings). 
          Current language is ${lang === "hi-IN" ? "Hindi" : "English"}.`
        })
      })
      const data = await res.json()
      const aiText = data.data || "I'm sorry, sir. I couldn't process that request."
      setResponse(aiText)
      speak(aiText)
    } catch (error) {
       speak("Communication error, sir. Please try again.")
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      setTranscript("")
      setResponse("")
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  // Welcome Greeting (Session based)
  useEffect(() => {
    const hasGreeted = sessionStorage.getItem("jarvis_greeted")
    const currentLang = lang
    const timer = setTimeout(() => {
      if (!welcomeTriggered.current && userName && !hasGreeted) {
        welcomeTriggered.current = true
        sessionStorage.setItem("jarvis_greeted", "true")
        const greeting = currentLang === "en-US" 
          ? `Welcome back, ${userName.split(' ')[0]}. All systems are online. How can I assist you today?`
          : `Swagat hai, ${userName.split(' ')[0]}. Sabhi systems online hain. Mai aapki kya madad kar sakta hoon?`
        speak(greeting)
        setResponse(greeting)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [userName, lang])

  return (
    <div className="fixed bottom-[104px] right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none transition-all duration-300">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="pointer-events-auto w-[320px] glass-strong rounded-[2.5rem] shadow-premium overflow-hidden border border-blue-500/20"
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between bg-blue-600/10 border-b border-blue-500/10">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Jarvis Systems</span>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setLang(lang === "en-US" ? "hi-IN" : "en-US")}
                    className="h-8 w-8 rounded-xl hover:bg-blue-500/10"
                >
                    <Globe className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-xl hover:bg-red-500/10"
                >
                    <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
               {/* Animated Orb Area */}
               <div className="flex justify-center py-4">
                  <div className="relative">
                     {/* Ripple Effect */}
                     <AnimatePresence>
                        {(isListening || isSpeaking) && (
                           <>
                              <motion.div 
                                 initial={{ scale: 0.8, opacity: 0 }}
                                 animate={{ scale: 2, opacity: 0 }}
                                 transition={{ repeat: Infinity, duration: 1.5 }}
                                 className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                              />
                              <motion.div 
                                 initial={{ scale: 0.8, opacity: 0 }}
                                 animate={{ scale: 2.5, opacity: 0 }}
                                 transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                                 className="absolute inset-0 rounded-full border border-blue-400/20"
                              />
                           </>
                        )}
                     </AnimatePresence>
                     
                     {/* Outer Ring */}
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="w-20 h-20 rounded-full border-2 border-dashed border-blue-500/30 flex items-center justify-center"
                     >
                        {/* Middle Ring */}
                        <motion.div 
                           animate={{ rotate: -360 }}
                           transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                           className="w-16 h-16 rounded-full border border-blue-400/40 flex items-center justify-center p-1"
                        >
                            {/* Inner Core */}
                            <div className={cn(
                                "w-full h-full rounded-full transition-all duration-500 flex items-center justify-center overflow-hidden",
                                isListening ? "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.6)]" : 
                                isSpeaking ? "bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.7)]" : 
                                "bg-slate-800 shadow-inner"
                            )}>
                               <Brain className={cn("w-6 h-6 text-white transition-opacity", isListening || isSpeaking ? "opacity-100" : "opacity-30")} />
                            </div>
                        </motion.div>
                     </motion.div>
                  </div>
               </div>

               {/* Transcript / Response */}
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                    {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "System Idle"}
                  </p>
                  <ScrollArea className="h-20 w-full px-2">
                    <p className="text-xs font-semibold leading-relaxed text-foreground">
                        {isListening ? (transcript || "Speak now...") : (response || "Ask Jarvis to navigate or help you.")}
                    </p>
                  </ScrollArea>
               </div>

               {/* Controls */}
               <div className="flex flex-col items-center gap-3">
                  <Button 
                    variant="outline"
                    onClick={toggleListening}
                    className={cn(
                        "w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                        isListening ? "bg-red-500/10 border-red-500/50 text-red-600 animate-pulse" : "bg-blue-500/5 border-blue-500/20 text-blue-600"
                    )}
                  >
                    {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    {isListening ? "Stop Listening" : "Start Conversation"}
                  </Button>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 leading-none">
                     <span className={cn("inline-block w-1.5 h-1.5 rounded-full", isListening || isSpeaking ? "bg-green-500" : "bg-slate-400")} />
                     System Language: <span className="text-foreground">{lang === "en-US" ? "English" : "Hindi"}</span>
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "pointer-events-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-premium transition-all relative overflow-hidden",
          isOpen ? "bg-slate-900 border border-white/10" : "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-glow"
        )}
      >
        {isOpen ? (
            <Zap className="w-6 h-6 text-blue-500 animate-pulse" />
        ) : (
            <>
                <div className="absolute inset-0 bg-blue-400/10 animate-pulse" />
                <Brain className="w-6 h-6 text-white relative z-10" />
            </>
        )}
      </motion.button>
    </div>
  )
}
