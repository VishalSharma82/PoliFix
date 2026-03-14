"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSoundContext } from "@/components/providers/SoundProvider";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export const SoundToggle = () => {
  const { isMuted, toggleMute } = useSoundContext();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="w-9 h-9 rounded-full transition-all duration-300 hover:bg-primary/10"
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? (
              <VolumeX className="h-[1.2rem] w-[1.2rem] text-muted-foreground transition-all" />
            ) : (
              <Volume2 className="h-[1.2rem] w-[1.2rem] text-primary transition-all animate-in zoom-in duration-300" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isMuted ? "Enable sounds" : "Disable sounds"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
