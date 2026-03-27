"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft, Github, Chrome, Loader2 } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <AuthContent />
        </Suspense>
    )
}

function AuthContent() {
    const [activeTab, setActiveTab] = useState("login")
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const redirectTo = searchParams?.get("next") || "/dashboard"

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        setLoading(true)
        try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${siteUrl}/auth/callback?next=${redirectTo}`,
                },
            })
            if (error) throw error
        } catch (err: any) {
            toast.error(err.message || `Failed to sign in with ${provider}`)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-hero opacity-50" />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -45, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-accent/10 blur-[100px] rounded-full"
                />
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </motion.div>

                {/* Logo/Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg mb-4">
                        <Shield className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground">Problem Map</h1>
                    <p className="text-muted-foreground mt-2">Join the civic revolution</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 backdrop-blur-md rounded-xl mb-6">
                            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                                Login
                            </TabsTrigger>
                            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                                Sign Up
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative">
                            <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <TabsContent key={activeTab} value={activeTab} className="mt-0 outline-none">
                                        <motion.div
                                            initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <CardHeader className="pt-8 px-8 pb-4">
                                                <CardTitle className="text-2xl font-bold">
                                                    {activeTab === "login" ? "Welcome Back" : "Create Account"}
                                                </CardTitle>
                                                <CardDescription>
                                                    {activeTab === "login"
                                                        ? "Enter your credentials to access your dashboard"
                                                        : "Join 12,000+ citizens making a difference today"}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="px-8 pb-8 flex flex-col gap-4">
                                                {/* Social Login */}
                                                <div className="grid grid-cols-2 gap-4 my-2">
                                                    <Button 
                                                        variant="outline" 
                                                        className="gap-2 backdrop-blur-sm bg-background/5 border-border/60 hover:bg-background/10 transition-all"
                                                        onClick={() => handleSocialLogin('github')}
                                                        disabled={loading}
                                                    >
                                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
                                                        Github
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        className="gap-2 backdrop-blur-sm bg-background/5 border-border/60 hover:bg-background/10 transition-all"
                                                        onClick={() => handleSocialLogin('google')}
                                                        disabled={loading}
                                                    >
                                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
                                                        Google
                                                    </Button>
                                                </div>

                                                <div className="relative my-4">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <span className="w-full border-t border-border/50" />
                                                    </div>
                                                    <div className="relative flex justify-center text-xs uppercase">
                                                        <span className="bg-transparent px-2 text-muted-foreground font-medium">Or continue with</span>
                                                    </div>
                                                </div>

                                                {activeTab === "login" ? <LoginForm redirectTo={redirectTo} /> : <SignUpForm redirectTo={redirectTo} />}
                                            </CardContent>
                                        </motion.div>
                                    </TabsContent>
                                </AnimatePresence>
                            </Card>
                        </div>
                    </Tabs>
                </motion.div>

                {/* Support link */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-sm text-muted-foreground mt-8"
                >
                    Having trouble? <Link href="/support" className="text-primary hover:underline font-medium">Contact citizen support</Link>
                </motion.p>
            </div>
        </div>
    )
}
