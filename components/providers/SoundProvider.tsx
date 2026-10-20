"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SoundType, SOUNDS } from "@/hooks/useSound";

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  play: (type: SoundType, volume?: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(true); // Default muted to follow autoplay policies
  const [isInitialized, setIsInitialized] = useState(false);
  const audioCache = React.useRef<{ [key in SoundType]?: HTMLAudioElement }>({});

  useEffect(() => {
    const stored = localStorage.getItem("app-sounds-muted");
    if (stored !== null) {
      setIsMuted(stored === "true");
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("app-sounds-muted", String(isMuted));
    }
  }, [isMuted, isInitialized]);

  const play = useCallback((type: SoundType, volume: number = 0.5) => {
    if (isMuted) return;

    try {
      if (!audioCache.current[type]) {
        audioCache.current[type] = new Audio(SOUNDS[type]);
      }

      const audio = audioCache.current[type];
      if (audio) {
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Gracefully ignore missing audio files or browser autoplay restrictions
        });
      }
    } catch {
      // Gracefully ignore audio setup errors
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, play }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSoundContext must be used within a SoundProvider");
  }
  return context;
};
