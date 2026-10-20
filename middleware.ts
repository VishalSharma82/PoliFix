import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If Supabase credentials are not configured or are placeholder, continue without crashing
    if (!rawUrl || !supabaseAnonKey || rawUrl.includes('placeholder')) {
        return response
    }

    const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        // Refresh session if expired
        const { data: { user } } = await supabase.auth.getUser()

        const { pathname } = request.nextUrl

        // 1. Protected routes check: /dashboard/*
        if (pathname.startsWith('/dashboard')) {
            if (!user) {
                const redirectUrl = request.nextUrl.clone()
                redirectUrl.pathname = '/auth'
                redirectUrl.searchParams.set('next', pathname)
                return NextResponse.redirect(redirectUrl)
            }
        }

        // 2. Auth pages check: Redirect to dashboard if already logged in
        const authPages = ['/auth', '/login', '/signup']
        if (authPages.includes(pathname)) {
            if (user) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        }
    } catch (err) {
        // Log warning but don't crash request with 500/504 if Supabase is unreachable
        console.warn('Middleware Supabase auth notice:', err)
    }

    return response
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth', '/login', '/signup'],
}
