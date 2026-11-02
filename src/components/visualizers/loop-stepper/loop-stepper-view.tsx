"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LoopStepperFrame } from "@/lib/visualizers/loop-stepper/engine";

export function describeLoopStepper(frame: LoopStepperFrame) {
  if (frame.kind === "idle") return "Loop stepper is ready.";
  return `i=${frame.i}, n=${frame.n}, total=${frame.total}.`;
}

export function LoopStepperView({ frame }: { frame: LoopStepperFrame }) {
  const reduceMotion = useReducedMotion();
  const label = frame.kind === "plates" ? "plates" : frame.kind === "count" ? "counts" : "numbers";

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="sr-only">{describeLoopStepper(frame)}</p>

      <div className="flex flex-wrap items-center justify-center gap-2" aria-hidden="true">
        <Stat label="i" value={frame.i || "—"} />
        <Stat label="n" value={frame.n || "—"} />
        <Stat
          label={frame.kind === "sum" ? "total" : frame.kind === "plates" ? "washed" : "count"}
          value={frame.total}
          emphasize
        />
      </div>

      <div className="flex w-full max-w-xl flex-wrap justify-center gap-2" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          {frame.items.map((item) => (
            <motion.div
              key={item.id}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex size-12 flex-col items-center justify-center rounded-xl border-2 font-mono text-sm font-bold shadow-sm",
                item.focus && "border-primary bg-primary/15 ring-primary/30 ring-4",
                item.done && !item.focus && "border-success/50 bg-success/10",
                !item.done && !item.focus && "border-border bg-card",
              )}
            >
              <span>{item.id}</span>
              {frame.kind === "plates" ? (
                <span className="text-muted-foreground text-[9px] font-medium uppercase">
                  {item.done ? "clean" : "dirty"}
                </span>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
        {frame.items.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border-2 border-dashed px-4 py-6 text-sm">
            Press play to start the loop.
          </div>
        ) : null}
      </div>

      {frame.kind !== "idle" && frame.items.length > 0 ? (
        <p className="text-muted-foreground text-xs" aria-hidden="true">
          Each box is one {label.slice(0, -1)} in the loop.
        </p>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string | number;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-center",
        emphasize ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
    >
      <div className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
        {label}
      </div>
      <div className="font-mono text-lg font-bold">{value}</div>
    </div>
  );
}
