'use client'

import { useEffect, ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.1,
      infinite: false,
      smoothWheel: true,
      wheelMultiplier: 1.0,
    })

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Handle anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        const targetId = anchor.getAttribute('href')
        const targetElement = document.querySelector(targetId!) as HTMLElement
        if (targetElement) {
          e.preventDefault()
          lenis.scrollTo(targetElement)
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      lenis.destroy()
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  return <>{children}</>
}
