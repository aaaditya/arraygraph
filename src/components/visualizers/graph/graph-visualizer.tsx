"use client";

import { useMemo } from "react";
import { buildGraphFrames, GRAPH_PSEUDOCODE, parseGraphOps } from "@/lib/visualizers/graph/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { GraphView } from "./graph-view";

export function GraphVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Graph visualizer",
}: VisualizerProps) {
  const parsed = useMemo(() => parseGraphOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildGraphFrames(initial, parsed.value) : []),
    [initial, parsed],
  );

  if (!parsed.ok) {
    return (
      <div
        role="alert"
        className="border-destructive bg-destructive/10 rounded-xl border p-4 text-sm"
      >
        <p className="font-semibold">This visualizer has invalid steps:</p>
        <ul className="mt-2 list-disc pl-5">
          {parsed.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <VisualizerPlayer
      title={title}
      frames={frames}
      pseudocode={GRAPH_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <GraphView frame={frame} />}
    />
  );
}
