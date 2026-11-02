"use client";

import { useMemo } from "react";
import {
  buildLoopStepperFrames,
  LOOP_STEPPER_PSEUDOCODE,
  parseLoopOps,
} from "@/lib/visualizers/loop-stepper/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { LoopStepperView } from "./loop-stepper-view";

export function LoopStepperVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Loop stepper",
}: VisualizerProps) {
  const parsed = useMemo(() => parseLoopOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildLoopStepperFrames(initial, parsed.value) : []),
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
      pseudocode={LOOP_STEPPER_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <LoopStepperView frame={frame} />}
    />
  );
}
