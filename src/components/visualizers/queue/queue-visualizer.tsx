"use client";

import { useMemo } from "react";
import { buildQueueFrames, parseQueueOps, QUEUE_PSEUDOCODE } from "@/lib/visualizers/queue/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { QueueView } from "./queue-view";

export function QueueVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Queue visualizer",
}: VisualizerProps) {
  const parsed = useMemo(() => parseQueueOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildQueueFrames(initial, parsed.value) : []),
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
      pseudocode={QUEUE_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <QueueView frame={frame} />}
    />
  );
}
