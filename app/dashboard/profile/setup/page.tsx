"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, MapPin, AlignLeft, Camera, ArrowRight, Loader2, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfileSetupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)
    const [formData, setFormData] = useState({
        full_name: "",
        bio: "",
        location: "",
    })

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/login")
                return
            }
            setUser(user)
            if (user.user_metadata?.full_name) {
                setFormData(prev => ({ ...prev, full_name: user.user_metadata.full_name }))
            }
            setInitialLoading(false)
        }
        checkUser()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: upsertError } = await (supabase
                .from('profiles') as any)
                .upsert({
                    id: user.id,
                    full_name: formData.full_name,
                    bio: formData.bio,
                    location: formData.location,
                    updated_at: new Date().toISOString(),
                })

            if (upsertError) throw upsertError

            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Failed to save profile")
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-black">Complete Your Profile</CardTitle>
                        <CardDescription className="text-lg">
                            Tell the community a bit about yourself before we get started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        {error && (
                            <Alert variant="destructive" className="mb-6 rounded-2xl">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group">
                                    <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                                        <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                                            {formData.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button type="button" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground mt-4 font-medium tracking-tight">Profile Picture (Optional)</p>
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Enter your full name"
                                            className="pl-12 h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            placeholder="e.g. San Francisco, CA"
                                            className="pl-12 h-14 rounded-2xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Bio</label>
                                    <div className="relative">
                                        <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                                        <Textarea
                                            placeholder="Tell us why you care about your community..."
                                            className="pl-12 min-h-[120px] rounded-2xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20 pt-4"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 mt-4" disabled={loading}>
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        Complete Setup
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
