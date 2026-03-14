import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
})

export const metadata: Metadata = {
  title: 'Problem Map - Report & Track City Infrastructure Issues',
  description: 'A community-driven platform that allows citizens to report, verify, track, and help resolve infrastructure problems in their city using an interactive map.',
  keywords: ['civic tech', 'infrastructure', 'community reporting', 'city problems', 'urban issues'],
}

export const viewport: Viewport = {
  themeColor: '#3b5998',
  width: 'device-width',
  initialScale: 1,
}

import { SoundProvider } from "@/components/providers/SoundProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <SoundProvider>
          {children}
        </SoundProvider>
        <Analytics />
      </body>
    </html>
  )
}
