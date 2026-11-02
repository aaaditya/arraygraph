"use client";

import { PlayCircleIcon } from "lucide-react";
import { humanize } from "@/lib/content/catalog";
import {
  type VisualizerProps,
  type VisualizerType,
  visualizerRegistry,
} from "@/components/visualizers/registry";

export function Visualizer({ type, ...props }: VisualizerProps & { type: VisualizerType }) {
  const Component = visualizerRegistry[type];
  if (!Component) {
    return (
      <div className="text-muted-foreground my-6 flex items-center gap-3 rounded-xl border border-dashed p-6">
        <PlayCircleIcon className="size-6" aria-hidden="true" />
        The {humanize(type)} visualizer is coming soon.
      </div>
    );
  }
  return (
    <div className="my-6">
      <Component {...props} />
    </div>
  );
}
