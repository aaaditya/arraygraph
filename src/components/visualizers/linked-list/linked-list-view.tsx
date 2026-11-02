"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LinkedListFrame } from "@/lib/visualizers/linked-list/engine";

const focusStyles = {
  append: "border-success bg-success/15 ring-success/40 ring-4",
  prepend: "border-success bg-success/15 ring-success/40 ring-4",
  delete: "border-destructive bg-destructive/15 ring-destructive/40 ring-4",
  reverse: "border-primary bg-primary/15 ring-primary/40 ring-4",
} as const;

export function describeLinkedList(frame: LinkedListFrame) {
  if (frame.nodes.length === 0) return "The linked list is empty.";
  return `head → ${frame.nodes.map((node) => node.value).join(" → ")} → null.`;
}

export function LinkedListView({ frame }: { frame: LinkedListFrame }) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 32 };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="sr-only">{describeLinkedList(frame)}</p>

      <div className="flex min-h-8 items-center" aria-hidden="true">
        {frame.output !== undefined ? (
          <motion.span
            key={`${frame.opIndex}-${frame.output}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-mono text-sm font-semibold"
          >
            removed {frame.output}
          </motion.span>
        ) : null}
      </div>

      <div
        className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-1"
        aria-hidden="true"
      >
        <span className="text-muted-foreground mr-1 text-xs font-semibold">head</span>
        <AnimatePresence initial={false} mode="popLayout">
          {frame.nodes.map((node, index) => {
            const focused = node.id === frame.focusId && frame.focusKind;
            return (
              <motion.div
                key={node.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                transition={transition}
                className="flex items-center gap-1"
              >
                <div
                  className={cn(
                    "bg-card flex h-12 min-w-12 items-center justify-center rounded-lg border-2 px-3 font-mono text-base font-semibold shadow-sm",
                    focused ? focusStyles[frame.focusKind!] : "border-border",
                  )}
                >
                  {node.value}
                </div>
                <span className="text-muted-foreground px-0.5 font-mono text-sm">→</span>
                {index === frame.nodes.length - 1 ? (
                  <span className="text-muted-foreground font-mono text-sm">null</span>
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {frame.nodes.length === 0 ? (
          <div className="text-muted-foreground flex h-12 items-center gap-2 rounded-lg border-2 border-dashed px-4 text-sm">
            head → null
          </div>
        ) : null}
      </div>
    </div>
  );
}
