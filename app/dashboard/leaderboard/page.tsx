"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    Trophy,
    Medal,
    Star,
    TrendingUp,
    MapPin,
    ThumbsUp,
    CheckCircle2,
    Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"
import { getCivicLevel, getLevelProgress, CIVIC_LEVELS } from "@/lib/priority"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchLeaders() {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .order('reputation_points', { ascending: false })
                .limit(20)

            if (data) setLeaders(data)
            setLoading(false)
        }
        fetchLeaders()
    }, [])

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">Calculating Ranking...</p>
            </div>
        )
    }

    const topThree = leaders.slice(0, 3)
    const rest = leaders.slice(3)

    return (
        <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Trophy className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Hall of Impact</span>
                </div>
                <h1 className="text-5xl font-black text-foreground tracking-tight">Civic Champions</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                    Recognizing the citizens who go above and beyond to improve our city infrastructure.
                </p>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-10">
                {/* Silver - 2nd Place */}
                {topThree[1] && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="order-2 md:order-1"
                    >
                        <div className="bg-card/50 backdrop-blur-xl border border-border/40 rounded-[3rem] p-8 text-center relative pt-16">
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                <div className="relative">
                                    <Avatar className="w-24 h-24 border-4 border-slate-300 shadow-2xl">
                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-black text-2xl">
                                            {topThree[1].full_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-slate-300 flex items-center justify-center shadow-lg border-2 border-white">
                                        <Medal className="w-6 h-6 text-slate-600" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">{topThree[1].full_name}</h3>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Silver Contributor</p>
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <div className="text-center">
                                    <p className="text-lg font-black text-primary">{topThree[1].reputation_points}</p>
                                    <p className="text-[8px] font-black uppercase text-muted-foreground">PTS</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Gold - 1st Place */}
                {topThree[0] && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="order-1 md:order-2"
                    >
                        <div className="bg-primary text-white border-4 border-primary/20 rounded-[3rem] p-10 text-center relative pt-20 shadow-[0_30px_60px_rgba(var(--primary),0.3)]">
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/20 blur-3xl animate-pulse" />
                                    <Avatar className="w-32 h-32 border-8 border-white shadow-2xl relative">
                                        <AvatarFallback className="bg-white text-primary font-black text-4xl">
                                            {topThree[0].full_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl bg-orange-400 flex items-center justify-center shadow-2xl border-4 border-white rotate-12">
                                        <Trophy className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter">{topThree[0].full_name}</h3>
                            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mt-1">Community Legend</p>
                            <div className="mt-8 flex items-center justify-center gap-6 bg-white/10 rounded-3xl p-4 backdrop-blur-md">
                                <div className="text-center">
                                    <p className="text-3xl font-black">{topThree[0].reputation_points}</p>
                                    <p className="text-[10px] font-black uppercase opacity-60">Total Reputation</p>
                                </div>
                            </div>
                            <div className="absolute top-10 right-10 opacity-20 rotate-12">
                                <Star className="w-12 h-12 fill-current" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Bronze - 3rd Place */}
                {topThree[2] && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="order-3"
                    >
                        <div className="bg-card/50 backdrop-blur-xl border border-border/40 rounded-[3rem] p-8 text-center relative pt-16">
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                <div className="relative">
                                    <Avatar className="w-24 h-24 border-4 border-orange-200 shadow-2xl">
                                        <AvatarFallback className="bg-orange-50 text-orange-600 font-black text-2xl">
                                            {topThree[2].full_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-orange-200 flex items-center justify-center shadow-lg border-2 border-white">
                                        <Medal className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">{topThree[2].full_name}</h3>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Bronze Contributor</p>
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <div className="text-center">
                                    <p className="text-lg font-black text-primary">{topThree[2].reputation_points}</p>
                                    <p className="text-[8px] font-black uppercase text-muted-foreground">PTS</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Leaderboard Table */}
            <Card className="border-border/40 shadow-2xl rounded-[3rem] bg-card/30 backdrop-blur-xl overflow-hidden">
                <CardHeader className="p-8 lg:p-12 pb-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-black tracking-tight">Community Ranking</CardTitle>
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border/40">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Updates</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 lg:p-12 space-y-4">
                    {rest.map((leader, index) => {
                        const level = getCivicLevel(leader.reputation_points)
                        const progress = getLevelProgress(leader.reputation_points)
                        return (
                        <motion.div
                            key={leader.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-6 p-6 rounded-[2rem] border border-border/20 hover:bg-background/80 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-lg font-black shrink-0 group-hover:bg-primary/10 transition-colors">
                                #{index + 4}
                            </div>
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <Avatar className="w-12 h-12 border-2 border-border/40">
                                    <AvatarFallback className="font-bold">{leader.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{leader.full_name}</h3>
                                    <div className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${level.bgColor} ${level.color} ${level.borderColor}`}>
                                        {level.emoji} {level.title}
                                    </div>
                                    {/* Progress to next level */}
                                    {level.maxPoints !== Infinity && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                                            </div>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase">{progress}% → {level.nextTitle}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                                <p className="text-2xl font-black text-primary tracking-tighter">{leader.reputation_points}</p>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Reputation</p>
                            </div>
                        </motion.div>
                        )
                    })}

                    <div className="mt-8 text-center pt-8 border-t border-border/20">
                        <Button variant="ghost" className="rounded-2xl font-black text-xs uppercase tracking-widest h-14 px-10 hover:bg-primary/5 text-primary">
                            View Global Rankings
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Civic Levels Legend */}
            <Card className="border-border/40 shadow-xl rounded-[2.5rem] bg-card/40 backdrop-blur-md">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-2xl font-black tracking-tight">Civic Level System</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Your reputation points unlock higher civic levels</p>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        {CIVIC_LEVELS.map(level => (
                            <div key={level.title} className={`p-5 rounded-[1.5rem] border text-center ${level.bgColor} ${level.borderColor}`}>
                                <div className="text-3xl mb-2">{level.emoji}</div>
                                <p className={`font-black text-sm ${level.color}`}>{level.title}</p>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                                    {level.maxPoints === Infinity ? `${level.minPoints}+ pts` : `${level.minPoints}–${level.maxPoints} pts`}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/20">
                        {[
                            { title: "+10 pts", desc: "Report an issue", icon: MapPin },
                            { title: "+5 pts", desc: "Verify an issue", icon: ThumbsUp },
                            { title: "+20 pts", desc: "Issue resolved", icon: CheckCircle2 },
                        ].map(item => (
                            <div key={item.title} className="flex items-center gap-3 p-4 rounded-2xl bg-background/50">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <item.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-black text-primary text-lg leading-none">{item.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
