"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { QueueFrame } from "@/lib/visualizers/queue/engine";

const focusStyles = {
  enqueue: "border-success bg-success/15 ring-success/40 ring-4",
  dequeue: "border-destructive bg-destructive/15 ring-destructive/40 ring-4",
  peek: "border-primary bg-primary/15 ring-primary/40 ring-4",
} as const;

export function describeQueue(frame: QueueFrame) {
  if (frame.items.length === 0) return "The queue is empty.";
  const values = frame.items.map((item) => item.value);
  return `Queue from front to back: ${values.join(", ")}. Front is ${values[0]}.`;
}

export function QueueView({ frame }: { frame: QueueFrame }) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 32 };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="sr-only">{describeQueue(frame)}</p>

      <div className="flex min-h-8 items-center" aria-hidden="true">
        {frame.output !== undefined ? (
          <motion.span
            key={`${frame.opIndex}-${frame.output}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-mono text-sm font-semibold"
          >
            returned {frame.output}
          </motion.span>
        ) : null}
      </div>

      <div className="relative flex w-full max-w-xl flex-col gap-2" aria-hidden="true">
        <div className="text-muted-foreground flex justify-between px-1 text-xs font-semibold">
          <span>front →</span>
          <span>← back</span>
        </div>
        <div className="flex min-h-14 flex-wrap items-center gap-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {frame.items.map((item) => {
              const focused = item.id === frame.focusId && frame.focusKind;
              return (
                <motion.div
                  key={item.id}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, x: 40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -48, scale: 0.9 }}
                  transition={transition}
                  className={cn(
                    "bg-card flex h-12 min-w-12 items-center justify-center rounded-lg border-2 px-3 font-mono text-base font-semibold shadow-sm",
                    focused ? focusStyles[frame.focusKind!] : "border-border",
                  )}
                >
                  {item.value}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {frame.items.length === 0 ? (
            <div className="text-muted-foreground flex h-12 w-full items-center justify-center rounded-lg border-2 border-dashed text-sm">
              empty
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
