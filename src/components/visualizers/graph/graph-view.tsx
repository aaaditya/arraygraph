"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GraphFrame } from "@/lib/visualizers/graph/engine";

export function describeGraph(frame: GraphFrame) {
  const parts = [
    `Visited: ${frame.visited.join(", ") || "(none)"}.`,
    frame.frontierKind
      ? `${frame.frontierKind}: [${frame.frontier.join(", ")}].`
      : "Frontier empty.",
  ];
  if (frame.current) parts.push(`Current: ${frame.current}.`);
  return parts.join(" ");
}

/** Simple circle layout for up to ~12 nodes. */
function positionFor(index: number, total: number, radius = 110) {
  if (total <= 0) return { x: 0, y: 0 };
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

export function GraphView({ frame }: { frame: GraphFrame }) {
  const reduceMotion = useReducedMotion();
  const visited = new Set(frame.visited);
  const frontier = new Set(frame.frontier);
  const size = 280;
  const center = size / 2;
  const positions = new Map(
    frame.nodes.map((node, index) => [node, positionFor(index, frame.nodes.length)]),
  );

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="sr-only">{describeGraph(frame)}</p>

      <div
        className="flex min-h-8 flex-wrap items-center justify-center gap-2 text-xs"
        aria-hidden="true"
      >
        {frame.frontierKind ? (
          <span className="bg-muted rounded-md px-2 py-1 font-mono">
            {frame.frontierKind}: [{frame.frontier.join(", ")}]
          </span>
        ) : null}
        <span className="bg-muted rounded-md px-2 py-1 font-mono">
          visited: {"{" + frame.visited.join(", ") + "}"}
        </span>
        {frame.output !== undefined ? (
          <motion.span
            key={`${frame.opIndex}-${frame.output}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-mono text-sm font-semibold"
          >
            {frame.output || "done"}
          </motion.span>
        ) : null}
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="h-64 w-64 max-w-full" aria-hidden="true">
        {frame.edges.map((edge) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={center + from.x}
              y1={center + from.y}
              x2={center + to.x}
              y2={center + to.y}
              className="stroke-border"
              strokeWidth={2}
            />
          );
        })}
        {frame.nodes.map((node) => {
          const pos = positions.get(node);
          if (!pos) return null;
          const isCurrent = frame.current === node;
          const isFrontier = frontier.has(node);
          const isVisited = visited.has(node);
          return (
            <g key={node} transform={`translate(${center + pos.x}, ${center + pos.y})`}>
              <motion.circle
                r={18}
                initial={false}
                animate={{ scale: isCurrent ? 1.12 : 1 }}
                className={cn(
                  "stroke-2",
                  isCurrent
                    ? "fill-primary/20 stroke-primary"
                    : isFrontier
                      ? "fill-success/15 stroke-success"
                      : isVisited
                        ? "fill-muted stroke-foreground/40"
                        : "fill-card stroke-border",
                )}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground font-mono text-[11px] font-semibold"
              >
                {node}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
