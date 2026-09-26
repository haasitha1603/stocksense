import React, { useEffect, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "../../lib/utils";

interface AIVoiceProps {
  onListeningChange?: (listening: boolean) => void;
  externalListening?: boolean;
  className?: string;
  onVoiceComplete?: () => void;
}

export function AIVoice({
  onListeningChange,
  externalListening,
  className,
  onVoiceComplete
}: AIVoiceProps) {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync external listening state if provided
  useEffect(() => {
    if (externalListening !== undefined) {
      setSubmitted(externalListening);
    }
  }, [externalListening]);

  useEffect(() => {
    let intervalId: any;

    if (submitted) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleClick = () => {
    const nextState = !submitted;
    setSubmitted(nextState);
    if (onListeningChange) {
      onListeningChange(nextState);
    }
    if (!nextState && onVoiceComplete) {
      onVoiceComplete();
    }
  };

  return (
    <div className={cn("w-full py-4 select-none", className)}>
      <div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-2">
        <button
          className={cn(
            "group flex h-16 w-16 items-center justify-center rounded-2xl transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800",
            submitted
              ? "bg-rose-500/10 border-rose-500/30"
              : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          )}
          onClick={handleClick}
          type="button"
          aria-label={submitted ? "Stop listening" : "Click to speak"}
        >
          {submitted ? (
            <div
              className="pointer-events-auto h-6 w-6 animate-spin cursor-pointer rounded-sm bg-rose-500"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="h-6 w-6 text-zinc-900 dark:text-white" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-xs transition-opacity duration-300",
            submitted
              ? "text-zinc-900 dark:text-white font-bold"
              : "text-zinc-400 dark:text-zinc-600"
          )}
        >
          {formatTime(time)}
        </span>

        {/* 48 Waveform bars */}
        <div className="flex h-5 w-64 items-center justify-center gap-0.5">
          {[...Array(48)].map((_, i) => (
            <div
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                submitted
                  ? "animate-pulse bg-zinc-900 dark:bg-white"
                  : "h-1 bg-zinc-300 dark:bg-zinc-800"
              )}
              key={i}
              style={
                submitted && isClient
                  ? {
                      height: `${20 + Math.sin(i * 0.4) * 40 + Math.random() * 40}%`,
                      animationDelay: `${i * 0.04}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
          {submitted ? "Listening to inventory voice query..." : "Click to speak with AI Copilot"}
        </p>
      </div>
    </div>
  );
}

export default AIVoice;
