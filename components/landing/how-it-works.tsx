"use client"

import { MapPin, Camera, Users, CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Pin the Location",
    description: "Drop a pin on the interactive map to mark the exact location of the problem you've discovered.",
    color: "bg-primary text-primary-foreground",
  },
  {
    number: "02",
    icon: Camera,
    title: "Upload Evidence",
    description: "Add photos and a detailed description to help others understand the issue and its severity.",
    color: "bg-accent text-accent-foreground",
  },
  {
    number: "03",
    icon: Users,
    title: "Community Verifies",
    description: "Other citizens confirm the issue, adding credibility and helping prioritize urgent problems.",
    color: "bg-primary text-primary-foreground",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Problem Resolved",
    description: "Track progress as local authorities address the issue and mark it as resolved.",
    color: "bg-success text-success-foreground",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to report and resolve infrastructure problems in your community.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-success/20 hidden lg:block" />
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col items-center text-center group">
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-6xl font-bold text-muted/20 select-none">
                  {step.number}
                </div>
                
                {/* Icon container */}
                <div className="relative z-10 mb-6">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} shadow-lg transition-transform group-hover:scale-110`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  {/* Connection dot */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-1/2 -right-4 h-2 w-2 rounded-full bg-border hidden lg:block" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual flow indicator - mobile */}
        <div className="mt-12 flex justify-center lg:hidden">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
                {index < steps.length - 1 && (
                  <div className="h-0.5 w-8 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
