"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MemoryBoxesFrame } from "@/lib/visualizers/memory-boxes/engine";

export function describeMemoryBoxes(frame: MemoryBoxesFrame) {
  if (frame.boxes.length === 0) return "Memory is empty.";
  return frame.boxes.map((box) => `${box.name} holds ${box.value}`).join(". ");
}

export function MemoryBoxesView({ frame }: { frame: MemoryBoxesFrame }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="sr-only">{describeMemoryBoxes(frame)}</p>

      {frame.output !== undefined ? (
        <motion.span
          key={`out-${frame.opIndex}-${frame.output}`}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-mono text-sm font-semibold"
          aria-hidden="true"
        >
          read → {frame.output}
        </motion.span>
      ) : null}

      <div
        className="flex w-full max-w-2xl flex-wrap items-end justify-center gap-3"
        aria-hidden="true"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {frame.boxes.map((box) => {
            const focused = frame.focus?.includes(box.name);
            return (
              <motion.div
                key={box.name}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "bg-card flex w-28 flex-col overflow-hidden rounded-xl border-2 shadow-sm",
                  focused ? "border-primary ring-primary/30 ring-4" : "border-border",
                )}
              >
                <div className="bg-muted border-b px-2 py-1 text-center text-xs font-semibold tracking-wide uppercase">
                  {box.name}
                </div>
                <div className="flex min-h-14 items-center justify-center px-2 py-3 font-mono text-lg font-bold">
                  {box.value}
                </div>
                <div className="text-muted-foreground border-t px-2 py-1 text-center text-[10px] font-medium uppercase">
                  {box.type}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {frame.highlightTemp ? (
          <motion.div
            key={`temp-${frame.tempValue}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-warning bg-warning/10 ring-warning/30 flex w-28 flex-col overflow-hidden rounded-xl border-2 border-dashed shadow-sm ring-4"
            aria-hidden="true"
          >
            <div className="bg-muted/60 border-b px-2 py-1 text-center text-xs font-semibold tracking-wide uppercase">
              temp
            </div>
            <div className="flex min-h-14 items-center justify-center px-2 py-3 font-mono text-lg font-bold">
              {frame.tempValue}
            </div>
            <div className="text-muted-foreground border-t px-2 py-1 text-center text-[10px] font-medium uppercase">
              helper
            </div>
          </motion.div>
        ) : null}

        {frame.boxes.length === 0 && !frame.highlightTemp ? (
          <div className="text-muted-foreground flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed text-sm">
            No labeled boxes yet
          </div>
        ) : null}
      </div>
    </div>
  );
}
