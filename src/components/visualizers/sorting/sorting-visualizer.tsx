"use client";

import { useMemo } from "react";
import {
  buildSortingFrames,
  parseSortingOps,
  SORTING_PSEUDOCODE,
} from "@/lib/visualizers/sorting/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { SortingView } from "./sorting-view";

export function SortingVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Sorting visualizer",
}: VisualizerProps) {
  const parsed = useMemo(() => parseSortingOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildSortingFrames(initial, parsed.value) : []),
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
      pseudocode={SORTING_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <SortingView frame={frame} />}
    />
  );
}
