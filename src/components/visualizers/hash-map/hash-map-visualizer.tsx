"use client";

import { useMemo } from "react";
import {
  buildHashMapFrames,
  HASH_MAP_PSEUDOCODE,
  parseHashMapOps,
} from "@/lib/visualizers/hash-map/engine";
import { VisualizerPlayer } from "../player/visualizer-player";
import type { VisualizerProps } from "../registry";
import { HashMapView } from "./hash-map-view";

export function HashMapVisualizer({
  initial = [],
  ops = [],
  showPseudocode = true,
  title = "Hash map visualizer",
}: VisualizerProps) {
  const parsed = useMemo(() => parseHashMapOps(ops), [ops]);
  const frames = useMemo(
    () => (parsed.ok ? buildHashMapFrames(initial, parsed.value) : []),
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
      pseudocode={HASH_MAP_PSEUDOCODE}
      showPseudocode={showPseudocode}
      renderFrame={(frame) => <HashMapView frame={frame} />}
    />
  );
}
