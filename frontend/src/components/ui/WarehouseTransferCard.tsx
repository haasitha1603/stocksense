import React, { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpDown,
  ArrowUpIcon,
  Check,
  InfoIcon,
  Layers,
  ArrowRight
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface WarehouseTransferCardProps {
  onConfirm?: () => void;
  className?: string;
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.2,
        type: "spring",
        duration: 1.5,
        bounce: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
      opacity: { delay: i * 0.2, duration: 0.3 },
    },
  }),
};

export function Checkmark({
  size = 80,
  strokeWidth = 3,
  color = "currentColor",
  className = "",
}: {
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}) {
  return (
    <motion.svg
      animate="visible"
      className={className}
      height={size}
      initial="hidden"
      viewBox="0 0 100 100"
      width={size}
    >
      <title>Animated Checkmark</title>
      <motion.circle
        custom={0}
        cx="50"
        cy="50"
        r="42"
        stroke={color}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          fill: "transparent",
          filter: "drop-shadow(0 0 2px rgba(16, 185, 129, 0.2))",
        }}
        variants={draw as any}
      />
      <motion.path
        custom={1}
        d="M32 50L45 63L68 35"
        stroke={color}
        style={{
          strokeWidth: strokeWidth + 0.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
          filter: "drop-shadow(0 0 1px rgba(16, 185, 129, 0.3))",
        }}
        variants={draw as any}
      />
    </motion.svg>
  );
}

export function WarehouseTransferCard({ onConfirm, className }: WarehouseTransferCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const transactionId = "TRF-2026-001 (Link: #8847)";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCompleted(true);
      if (onConfirm) onConfirm();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("mx-auto flex h-[430px] w-full max-w-sm flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl backdrop-blur-sm transition-all duration-500 dark:border-zinc-800 dark:bg-black", className)}>
      <div className="flex flex-1 flex-col justify-center space-y-4">
        {/* Animated Icon Header */}
        <div className="flex h-[80px] items-center justify-center">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative flex h-[100px] w-[100px] items-center justify-center">
              <motion.div
                animate={{ opacity: [0, 1, 0.8] }}
                className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl dark:bg-emerald-500/5"
                initial={{ opacity: 0 }}
                transition={{ duration: 1.5, times: [0, 0.5, 1], ease: [0.22, 1, 0.36, 1] }}
              />
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    animate={{ opacity: 1, rotate: 0 }}
                    className="flex h-[90px] w-[90px] items-center justify-center"
                    initial={{ opacity: 0, rotate: -180 }}
                    key="completed"
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <div className="relative z-10 rounded-full border border-emerald-500 bg-white p-4 dark:bg-zinc-900 shadow-lg">
                      <Check className="h-8 w-8 text-emerald-500" strokeWidth={3.5} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="flex h-[90px] w-[90px] items-center justify-center"
                    exit={{ opacity: 0, rotate: 360 }}
                    initial={{ opacity: 0 }}
                    key="progress"
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <div className="relative z-10">
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.02, 1] }}
                        className="absolute inset-0 rounded-full border-2 border-transparent"
                        style={{
                          borderLeftColor: "rgb(16 185 129)",
                          borderTopColor: "rgb(16 185 129 / 0.2)",
                          filter: "blur(0.5px)",
                        }}
                        transition={{
                          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        }}
                      />
                      <div className="relative z-10 rounded-full bg-zinc-100 p-4 shadow-md dark:bg-zinc-900">
                        <ArrowUpDown className="h-8 w-8 text-emerald-500" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Status Text */}
        <div className="flex h-[280px] flex-col">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 w-full space-y-1.5 text-center"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h3 className="font-extrabold text-base text-zinc-900 uppercase tracking-tight dark:text-white">
              {isCompleted ? "Transfer Atomic Commit Complete" : "Executing Double-Entry Transfer"}
            </h3>
            <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
              {isCompleted ? transactionId : "Conserving company balance..."}
            </p>

            {/* Source & Destination Warehouse Cards */}
            <div className="mt-4 flex flex-col gap-2 text-left">
              {/* Source (Debit) */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-rose-500">
                  <ArrowUpIcon className="h-3 w-3" />
                  Source: Regional Annex B (-40 Units)
                </span>
                <div className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
                  WH-ANNEX/STOCK: 160 → 120 Units
                </div>
              </div>

              {/* Destination (Credit) */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-emerald-500">
                  <ArrowDownIcon className="h-3 w-3" />
                  Target: Main Warehouse (+40 Units)
                </span>
                <div className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
                  MWH/STOCK: 85 → 125 Units (Stockout Averted!)
                </div>
              </div>
            </div>

            <div className="pt-3 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
              <span>Invariant Conservation:</span>
              <span className="text-emerald-500 font-bold">Net Delta = 0.0</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default WarehouseTransferCard;
