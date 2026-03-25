"use client";

import { useCallback, useRef } from "react";

export const SOUNDS = {
  click: "https://www.soundjay.com/buttons/sounds/button-16.mp3",
  slide: "https://www.soundjay.com/buttons/sounds/button-17.mp3",
  success: "https://www.soundjay.com/buttons/sounds/button-3.mp3",
  error: "https://www.soundjay.com/buttons/sounds/button-10.mp3",
} as const;

export type SoundType = keyof typeof SOUNDS;

export const useSound = () => {
  const audioRefs = useRef<{ [key in SoundType]?: HTMLAudioElement }>({});

  const play = useCallback((type: SoundType, volume: number = 0.5) => {
    // Check if sound enabled (this will be integrated with SoundProvider later)
    const isMuted = typeof window !== 'undefined' ? localStorage.getItem('app-sounds-muted') === 'true' : false;
    if (isMuted) return;

    if (!audioRefs.current[type]) {
      audioRefs.current[type] = new Audio(SOUNDS[type]);
    }

    const audio = audioRefs.current[type]!;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.warn(`Failed to play sound: ${type}`, err);
    });
  }, []);

  return { play };
};
