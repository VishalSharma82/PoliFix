"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export function SignUpForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (error) throw error

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || "Failed to create account. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="py-8 text-center space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Verification Sent!</h3>
                    <p className="text-muted-foreground px-4">
                        We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>.
                        Please check your inbox to activate your account.
                    </p>
                </div>
                <Button variant="outline" className="w-full h-11" onClick={() => window.location.reload()}>
                    Back to Login
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="name"
                        placeholder="John Doe"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/40 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/40 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/40 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-balance">
                <input type="checkbox" id="terms" required className="rounded border-border/60 bg-background/50" />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight">
                    By continuing, you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    "Create Account"
                )}
            </Button>
        </form>
    )
}
