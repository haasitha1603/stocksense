import React, { useState } from "react";
import { ArrowRight, Repeat2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CardFlipProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  ctaText?: string;
  onCtaClick?: () => void;
  accentColor?: string;
  className?: string;
}

export function CardFlip({
  title = "Double-Entry Invariants",
  subtitle = "Zero Black-Box Inventory Guesswork",
  description = "Every stock adjustment, receipt, transfer, and delivery is an immutable audit record.",
  features = ["100% Conservation", "Immutable Ledger", "ACID Transactions", "Grounded AI"],
  ctaText = "Explore Ledger",
  onCtaClick,
  className
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn("group relative h-[340px] w-full max-w-[300px] [perspective:2000px]", className)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-[transform] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]",
          "motion-reduce:transition-none",
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        )}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-3xl",
            "bg-zinc-50 dark:bg-zinc-950",
            "border border-zinc-200 dark:border-zinc-800",
            "shadow-md dark:shadow-xl",
            "transition-shadow duration-500 flex flex-col justify-between p-6"
          )}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                Core Module
              </span>
              <Repeat2 className="h-4 w-4 text-zinc-400 group-hover:rotate-180 transition-transform duration-500" />
            </div>

            <div className="pt-8">
              <h3 className="font-extrabold text-xl text-zinc-900 dark:text-white tracking-tight leading-tight">
                {title}
              </h3>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <span>Hover to inspect rules</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-3xl p-6 flex flex-col justify-between",
            "bg-zinc-900 text-white dark:bg-black dark:text-white",
            "border border-zinc-700 dark:border-zinc-800",
            "shadow-xl"
          )}
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">
                {title}
              </h3>
              <p className="mt-1 text-xs text-zinc-400 font-light leading-relaxed">
                {description}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {features.map((feature, index) => (
                <div
                  className="flex items-center gap-2 text-xs text-zinc-300 font-mono"
                  key={feature}
                  style={{
                    transform: isFlipped ? "translateX(0)" : "translateX(-10px)",
                    opacity: isFlipped ? 1 : 0,
                    transition: `transform 300ms ease ${index * 60 + 100}ms, opacity 300ms ease ${index * 60 + 100}ms`
                  }}
                >
                  <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={onCtaClick}
              type="button"
              className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardFlip;
