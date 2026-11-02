"use client";

import { useMemo } from "react";
import {
  buildLinkedListFrames,
  LINKED_LIST_PSEUDOCODE,
  parseLinkedListOps,
} from "@/lib/visualizers/linked-list/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { LinkedListView } from "./linked-list-view";

export function LinkedListVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Linked list visualizer",
}: VisualizerProps) {
  const parsed = useMemo(() => parseLinkedListOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildLinkedListFrames(initial, parsed.value) : []),
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
      pseudocode={LINKED_LIST_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <LinkedListView frame={frame} />}
    />
  );
}
