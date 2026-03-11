"use client"

import { useEffect, useRef } from "react"

interface ProblemMapProps {
  lat: number
  lng: number
  title: string
}

export function ProblemMap({ lat, lng, title }: ProblemMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    let destroyed = false

    const init = async () => {
      const L = (await import("leaflet")).default

      // Abort if the component was already unmounted while we were loading
      if (destroyed || !mapRef.current) return

      // Remove any stale Leaflet instance on the DOM node (handles Strict Mode double-mount)
      if ((mapRef.current as any)._leaflet_id) {
        mapInstanceRef.current?.remove()
        mapInstanceRef.current = null
        // Clear the internal ID so Leaflet allows re-initialization
        delete (mapRef.current as any)._leaflet_id
      }

      // Inject Leaflet CSS once
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link")
        link.id = "leaflet-css"
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      })

      mapInstanceRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // Custom pulsing marker
      const pulseIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:36px;height:36px;">
            <div style="
              position:absolute;inset:0;border-radius:50%;
              background:rgba(99,102,241,0.3);
              animation:pulse-ring 2s infinite;
            "></div>
            <div style="
              position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
              width:16px;height:16px;border-radius:50%;
              background:#6366f1;
              border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
            "></div>
          </div>
          <style>
            @keyframes pulse-ring {
              0%,100% { transform:scale(1);opacity:0.6; }
              50% { transform:scale(1.9);opacity:0; }
            }
          </style>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      L.marker([lat, lng], { icon: pulseIcon })
        .addTo(map)
        .bindPopup(`<b>${title}</b>`)

      // 500m radius circle
      L.circle([lat, lng], {
        radius: 500,
        color: "#6366f1",
        fillColor: "#6366f1",
        fillOpacity: 0.08,
        weight: 2,
        dashArray: "6 4",
      }).addTo(map)
    }

    init()

    return () => {
      destroyed = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [lat, lng, title])

  return <div ref={mapRef} className="w-full h-full" style={{ minHeight: "200px" }} />
}
