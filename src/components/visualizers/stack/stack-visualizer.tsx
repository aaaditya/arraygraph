"use client";

import { useMemo } from "react";
import { buildStackFrames, parseStackOps, STACK_PSEUDOCODE } from "@/lib/visualizers/stack/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { StackView } from "./stack-view";

export function StackVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Stack visualizer",
}: VisualizerProps) {
  const parsed = useMemo(() => parseStackOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildStackFrames(initial, parsed.value) : []),
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
      pseudocode={STACK_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <StackView frame={frame} />}
    />
  );
}
