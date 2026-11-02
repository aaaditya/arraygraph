"use client";

import { useMemo } from "react";
import {
  BINARY_SEARCH_PSEUDOCODE,
  buildBinarySearchFrames,
  parseBinarySearchOps,
} from "@/lib/visualizers/binary-search/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { BinarySearchView } from "./binary-search-view";

export function BinarySearchVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Binary search visualizer",
}: VisualizerProps) {
  const parsed = useMemo(() => parseBinarySearchOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildBinarySearchFrames(initial, parsed.value) : []),
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
      pseudocode={BINARY_SEARCH_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <BinarySearchView frame={frame} />}
    />
  );
}
