"use client";

import { useMemo } from "react";
import {
  buildStepRunnerFrames,
  parseStepRunnerOps,
  STEP_RUNNER_PSEUDOCODE,
} from "@/lib/visualizers/step-runner/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { StepRunnerView } from "./step-runner-view";

export function StepRunnerVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Step runner",
}: VisualizerProps) {
  const parsed = useMemo(() => parseStepRunnerOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildStepRunnerFrames(initial, parsed.value) : []),
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
      pseudocode={STEP_RUNNER_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <StepRunnerView frame={frame} />}
    />
  );
}
