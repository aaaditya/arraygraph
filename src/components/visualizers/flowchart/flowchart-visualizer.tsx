"use client";

import { useMemo } from "react";
import {
  buildFlowchartFrames,
  FLOWCHART_PSEUDOCODE,
  parseFlowchartOps,
} from "@/lib/visualizers/flowchart/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { FlowchartView } from "./flowchart-view";

export function FlowchartVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Flowchart runner",
}: VisualizerProps) {
  const parsed = useMemo(() => parseFlowchartOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildFlowchartFrames(initial, parsed.value) : []),
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
      pseudocode={FLOWCHART_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <FlowchartView frame={frame} />}
    />
  );
}
