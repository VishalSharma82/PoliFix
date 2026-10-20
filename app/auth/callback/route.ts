import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  let next = searchParams.get('next') ?? '/dashboard'
  if (!next.startsWith('/') || next === '/') {
    next = '/dashboard'
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (code && supabaseUrl && supabaseAnonKey) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.session?.user) {
      // If user came via signup or explicitly requested profile setup
      if (next === '/dashboard/profile/setup') {
        return NextResponse.redirect(`${origin}/dashboard/profile/setup`)
      }

      // Check if profile exists for this user
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, location')
        .eq('id', data.session.user.id)
        .maybeSingle()

      // If user has not completed profile setup yet, take them there first
      if (!profile || (!profile.full_name && !profile.location)) {
        return NextResponse.redirect(`${origin}/dashboard/profile/setup`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Auth callback error:', error)
  }

  // If error, redirect back to /auth with clean message
  return NextResponse.redirect(`${origin}/auth?error=oauth_failed`)
}
