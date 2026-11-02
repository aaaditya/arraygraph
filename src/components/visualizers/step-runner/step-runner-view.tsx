"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckIcon, CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepRunnerFrame } from "@/lib/visualizers/step-runner/engine";

export function describeStepRunner(frame: StepRunnerFrame) {
  if (frame.steps.length === 0) return "No steps.";
  if (frame.current < 0) return `Ready with ${frame.steps.length} steps.`;
  if (frame.done) return "All steps finished.";
  return `Doing step ${frame.current + 1}: ${frame.steps[frame.current]}.`;
}

export function StepRunnerView({ frame }: { frame: StepRunnerFrame }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="sr-only">{describeStepRunner(frame)}</p>
      <ol className="mx-auto flex w-full max-w-lg flex-col gap-2" aria-hidden="true">
        <AnimatePresence initial={false}>
          {frame.steps.map((step, index) => {
            const active = index === frame.current && !frame.done;
            const done = frame.done || index < frame.current;
            return (
              <motion.li
                key={`${index}-${step}`}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-3 rounded-xl border-2 px-3 py-2.5 text-sm",
                  active && "border-primary bg-primary/10 ring-primary/30 ring-4",
                  done && !active && "border-success/40 bg-success/10",
                  !done && !active && "border-border bg-card",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    active && "border-primary bg-primary text-primary-foreground",
                    done && !active && "border-success bg-success text-success-foreground",
                    !done && !active && "border-border text-muted-foreground",
                  )}
                >
                  {done && !active ? (
                    <CheckIcon className="size-3.5" aria-hidden="true" />
                  ) : active ? (
                    <CircleIcon className="size-3 fill-current" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="pt-0.5 font-medium">{step}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {frame.steps.length === 0 ? (
          <li className="text-muted-foreground rounded-xl border-2 border-dashed px-3 py-6 text-center text-sm">
            Add steps for the robot to follow.
          </li>
        ) : null}
      </ol>
    </div>
  );
}
