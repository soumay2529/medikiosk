"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { speakText, stopSpeaking, getAudioContext } from "@/lib/speech";
import { useKioskStore } from "@/store/useKioskStore";

interface AudioPromptButtonProps {
  textToSpeak: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AudioPromptButton: React.FC<AudioPromptButtonProps> = ({
  textToSpeak,
  label = "Listen",
  size = "md",
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const language = useKioskStore((state) => state.encounter.language);
  const slowMode = useKioskStore((state) => state.accessibility.slowMode);
  const ttsEnabled = useKioskStore((state) => state.accessibility.ttsEnabled);

  if (!ttsEnabled) return null;

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Wake audio context on click
    getAudioContext();

    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(textToSpeak, language, slowMode, () => {
        setIsPlaying(false);
      });
    }
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-11 px-4 text-sm gap-2",
    lg: "h-14 px-6 text-base gap-3",
  };

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      className={`inline-flex items-center justify-center rounded-xl font-bold transition-all border shadow-sm cursor-pointer active:scale-95 ${
        isPlaying
          ? "bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-300"
          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
      } ${sizeClasses[size]} ${className}`}
      aria-label={isPlaying ? "Stop audio playback" : `Read aloud: ${textToSpeak}`}
      title="Tap to hear this spoken aloud"
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-4 h-4 text-amber-700 animate-pulse" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-blue-600" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
};
