"use client";

import { useMemo } from "react";
import {
  buildMemoryBoxesFrames,
  MEMORY_BOXES_PSEUDOCODE,
  parseMemoryOps,
} from "@/lib/visualizers/memory-boxes/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { MemoryBoxesView } from "./memory-boxes-view";

export function MemoryBoxesVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Memory boxes",
}: VisualizerProps) {
  const parsed = useMemo(() => parseMemoryOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildMemoryBoxesFrames(initial, parsed.value) : []),
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
      pseudocode={MEMORY_BOXES_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <MemoryBoxesView frame={frame} />}
    />
  );
}
