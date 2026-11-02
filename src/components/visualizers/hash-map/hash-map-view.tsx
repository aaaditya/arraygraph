"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HashMapFrame } from "@/lib/visualizers/hash-map/engine";

const focusStyles = {
  set: "border-success bg-success/15 ring-success/40 ring-2",
  get: "border-primary bg-primary/15 ring-primary/40 ring-2",
  delete: "border-destructive bg-destructive/15 ring-destructive/40 ring-2",
} as const;

export function describeHashMap(frame: HashMapFrame) {
  const filled = frame.buckets
    .map((bucket, index) =>
      bucket.length
        ? `bucket ${index}: ${bucket.map((e) => `${e.key}:${e.value}`).join(", ")}`
        : null,
    )
    .filter(Boolean);
  return filled.length ? filled.join(". ") : "All buckets are empty.";
}

export function HashMapView({ frame }: { frame: HashMapFrame }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="sr-only">{describeHashMap(frame)}</p>

      <div className="flex min-h-8 items-center" aria-hidden="true">
        {frame.output !== undefined ? (
          <motion.span
            key={`${frame.opIndex}-${frame.output}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-mono text-sm font-semibold"
          >
            {frame.output}
          </motion.span>
        ) : null}
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2" aria-hidden="true">
        {frame.buckets.map((bucket, index) => {
          const focusedBucket = frame.focusBucket === index;
          return (
            <div
              key={index}
              className={cn(
                "rounded-lg border p-2 transition-colors",
                focusedBucket ? "border-primary bg-primary/5" : "border-border bg-card",
              )}
            >
              <p className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase">
                bucket {index}
              </p>
              <div className="flex min-h-9 flex-wrap gap-1.5">
                {bucket.length === 0 ? (
                  <span className="text-muted-foreground text-xs">∅</span>
                ) : (
                  bucket.map((entry) => {
                    const focused = entry.id === frame.focusId && frame.focusKind;
                    return (
                      <motion.div
                        key={entry.id}
                        layout={!reduceMotion}
                        className={cn(
                          "rounded-md border px-2 py-1 font-mono text-xs font-semibold",
                          focused ? focusStyles[frame.focusKind!] : "border-border bg-background",
                        )}
                      >
                        {entry.key}:{entry.value}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
