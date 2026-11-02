"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FlowchartFrame, FlowNodeId } from "@/lib/visualizers/flowchart/engine";

const NODES: { id: FlowNodeId; label: string; shape: "oval" | "diamond" | "rect" }[] = [
  { id: "start", label: "Start", shape: "oval" },
  { id: "ask", label: "What color?", shape: "diamond" },
  { id: "red", label: "Red?", shape: "diamond" },
  { id: "yellow", label: "Yellow?", shape: "diamond" },
  { id: "green", label: "Green?", shape: "diamond" },
  { id: "stop", label: "Stop", shape: "rect" },
  { id: "wait", label: "Wait", shape: "rect" },
  { id: "go", label: "Go", shape: "rect" },
  { id: "end", label: "Done", shape: "oval" },
];

const COLOR_RING = {
  red: "ring-destructive/40 border-destructive bg-destructive/15",
  yellow: "ring-warning/40 border-warning bg-warning/15",
  green: "ring-success/40 border-success bg-success/15",
} as const;

export function describeFlowchart(frame: FlowchartFrame) {
  if (frame.decision) return `Active node: ${frame.active}. Decision: ${frame.decision}.`;
  return `Active node: ${frame.active}.`;
}

export function FlowchartView({ frame }: { frame: FlowchartFrame }) {
  const reduceMotion = useReducedMotion();
  const visible = NODES.filter((node) => {
    if (node.id === "start" || node.id === "ask" || node.id === "end") return true;
    if (!frame.color) return node.id === "red" || node.id === "stop";
    if (frame.color === "red") return node.id === "red" || node.id === "stop";
    if (frame.color === "yellow") return node.id === "yellow" || node.id === "wait";
    return node.id === "green" || node.id === "go";
  });

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="sr-only">{describeFlowchart(frame)}</p>
      {frame.color ? (
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase",
            frame.color === "red" && "bg-destructive/15 text-destructive",
            frame.color === "yellow" && "bg-warning/15 text-warning-foreground",
            frame.color === "green" && "bg-success/15 text-success",
          )}
          aria-hidden="true"
        >
          light: {frame.color}
        </span>
      ) : null}
      <div className="flex w-full max-w-sm flex-col items-center gap-2" aria-hidden="true">
        {visible.map((node) => {
          const active = frame.active === node.id;
          return (
            <motion.div
              key={node.id}
              layout={!reduceMotion}
              animate={{ scale: active ? 1.04 : 1 }}
              className={cn(
                "flex min-h-11 w-full max-w-[220px] items-center justify-center border-2 px-3 py-2 text-center text-sm font-semibold",
                node.shape === "oval" && "rounded-full",
                node.shape === "diamond" && "rounded-lg rotate-0",
                node.shape === "rect" && "rounded-lg",
                active
                  ? cn("ring-4", frame.color ? COLOR_RING[frame.color] : "border-primary bg-primary/10 ring-primary/30")
                  : "border-border bg-card",
              )}
            >
              {node.label}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
