"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BinarySearchFrame } from "@/lib/visualizers/binary-search/engine";

export function describeBinarySearch(frame: BinarySearchFrame) {
  if (frame.values.length === 0) return "The array is empty.";
  const parts = [`Array: ${frame.values.join(", ")}.`];
  if (frame.mid !== undefined) parts.push(`mid=${frame.mid}.`);
  if (frame.foundIndex !== undefined) parts.push(`Found at index ${frame.foundIndex}.`);
  else parts.push(`Search window lo=${frame.lo}, hi=${frame.hi}.`);
  return parts.join(" ");
}

export function BinarySearchView({ frame }: { frame: BinarySearchFrame }) {
  const reduceMotion = useReducedMotion();
  const activeSet = new Set(frame.active);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="sr-only">{describeBinarySearch(frame)}</p>

      <div className="flex min-h-8 items-center gap-3 text-xs font-semibold" aria-hidden="true">
        <span className="text-muted-foreground">
          lo={frame.lo} · hi={frame.hi}
          {frame.mid !== undefined ? ` · mid=${frame.mid}` : ""}
        </span>
        {frame.output !== undefined ? (
          <motion.span
            key={`${frame.opIndex}-${frame.output}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-mono text-sm"
          >
            {frame.output === "not found" ? "not found" : `index ${frame.output}`}
          </motion.span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end justify-center gap-2" aria-hidden="true">
        {frame.values.length === 0 ? (
          <div className="text-muted-foreground flex h-14 w-40 items-center justify-center rounded-lg border-2 border-dashed text-sm">
            empty
          </div>
        ) : (
          frame.values.map((value, index) => {
            const inWindow = activeSet.has(index);
            const isMid = frame.mid === index;
            const isFound = frame.foundIndex === index;
            return (
              <motion.div
                key={`${index}-${value}`}
                layout={!reduceMotion}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-muted-foreground text-[10px] tabular-nums">{index}</span>
                <div
                  className={cn(
                    "bg-card flex h-14 w-12 items-center justify-center rounded-lg border-2 font-mono text-base font-semibold shadow-sm transition-colors",
                    isFound
                      ? "border-success bg-success/15 ring-success/40 ring-4"
                      : isMid
                        ? "border-primary bg-primary/15 ring-primary/40 ring-4"
                        : inWindow
                          ? "border-border"
                          : "border-border/40 text-muted-foreground opacity-40",
                  )}
                >
                  {value}
                </div>
                <span className="text-muted-foreground h-3 text-[10px] font-semibold">
                  {index === frame.lo && index === frame.hi
                    ? "lo/hi"
                    : index === frame.lo
                      ? "lo"
                      : index === frame.hi
                        ? "hi"
                        : isMid && !isFound
                          ? "mid"
                          : ""}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
