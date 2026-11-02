"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StackFrame } from "@/lib/visualizers/stack/engine";

const focusStyles = {
  push: "border-success bg-success/15 ring-success/40 ring-4",
  pop: "border-destructive bg-destructive/15 ring-destructive/40 ring-4",
  peek: "border-primary bg-primary/15 ring-primary/40 ring-4",
} as const;

export function describeStack(frame: StackFrame) {
  if (frame.items.length === 0) return "The stack is empty.";
  const values = frame.items.map((item) => item.value);
  return `Stack from bottom to top: ${values.join(", ")}. Top is ${values.at(-1)}.`;
}

export function StackView({ frame }: { frame: StackFrame }) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 32 };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="sr-only">{describeStack(frame)}</p>

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

      <div className="relative" aria-hidden="true">
        <div className="flex w-44 flex-col-reverse items-stretch gap-1.5 sm:w-52">
          <AnimatePresence initial={false} mode="popLayout">
            {frame.items.map((item) => {
              const focused = item.id === frame.focusId && frame.focusKind;
              return (
                <motion.div
                  key={item.id}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, y: -48, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -56, scale: 0.9 }}
                  transition={transition}
                  className={cn(
                    "bg-card relative flex h-10 items-center justify-center rounded-lg border-2 font-mono text-base font-semibold shadow-sm",
                    focused ? focusStyles[frame.focusKind!] : "border-border",
                  )}
                >
                  {item.value}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {frame.items.length === 0 ? (
            <div className="text-muted-foreground flex h-10 items-center justify-center rounded-lg border-2 border-dashed text-sm">
              empty
            </div>
          ) : null}
        </div>
        {frame.items.length > 0 ? (
          <span className="text-foreground absolute top-0 left-full ml-2 text-xs font-semibold whitespace-nowrap">
            ← top
          </span>
        ) : null}
      </div>
      <div className="bg-muted-foreground/40 h-1.5 w-52 rounded-full sm:w-60" aria-hidden="true" />
    </div>
  );
}
