"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SortingFrame } from "@/lib/visualizers/sorting/engine";

export function describeSorting(frame: SortingFrame) {
  if (frame.values.length === 0) return "The array is empty.";
  const parts = [`Array: ${frame.values.join(", ")}.`];
  if (frame.comparing) parts.push(`Comparing indices ${frame.comparing.join(" and ")}.`);
  if (frame.swapping) parts.push(`Swapping indices ${frame.swapping.join(" and ")}.`);
  return parts.join(" ");
}

export function SortingView({ frame }: { frame: SortingFrame }) {
  const reduceMotion = useReducedMotion();
  const sorted = new Set(frame.sorted);
  const comparing = new Set(frame.comparing ?? []);
  const swapping = new Set(frame.swapping ?? []);
  const max = Math.max(...frame.values.map(Math.abs), 1);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="sr-only">{describeSorting(frame)}</p>

      <div className="flex min-h-8 items-center gap-2 text-xs font-semibold" aria-hidden="true">
        {frame.algorithm ? (
          <span className="bg-muted rounded-md px-2 py-1 capitalize">{frame.algorithm} sort</span>
        ) : null}
        {frame.output !== undefined ? (
          <motion.span
            key={`${frame.opIndex}-${frame.output}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-mono text-sm"
          >
            sorted
          </motion.span>
        ) : null}
      </div>

      <div
        className="flex h-48 w-full max-w-xl items-end justify-center gap-1.5"
        aria-hidden="true"
      >
        {frame.values.length === 0 ? (
          <div className="text-muted-foreground flex h-14 w-40 items-center justify-center rounded-lg border-2 border-dashed text-sm">
            empty
          </div>
        ) : (
          frame.values.map((value, index) => {
            const height = Math.max(12, Math.round((Math.abs(value) / max) * 160));
            const isCompare = comparing.has(index);
            const isSwap = swapping.has(index);
            const isKey = frame.keyIndex === index;
            const isSorted = sorted.has(index);
            return (
              <motion.div
                key={`${index}-${value}`}
                layout={!reduceMotion}
                className="flex flex-col items-center gap-1"
                style={{ width: `${Math.min(48, 100 / frame.values.length)}%`, maxWidth: 40 }}
              >
                <div
                  className={cn(
                    "flex w-full items-end justify-center rounded-t-md border-2 font-mono text-[10px] font-semibold transition-colors",
                    isSwap
                      ? "border-destructive bg-destructive/20"
                      : isCompare || isKey
                        ? "border-primary bg-primary/20"
                        : isSorted
                          ? "border-success bg-success/15"
                          : "border-border bg-card",
                  )}
                  style={{ height }}
                >
                  <span className="pb-1">{value}</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
