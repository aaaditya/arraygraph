"use client";

import type * as React from "react";

export type VisualizerProps = {
  initial?: unknown[];
  ops?: string[];
  showPseudocode?: boolean;
  title?: string;
};

export const VISUALIZER_TYPES = [
  "stack",
  "queue",
  "linked-list",
  "hash-map",
  "binary-search",
  "tree",
  "graph",
  "sorting",
] as const;

export type VisualizerType = (typeof VISUALIZER_TYPES)[number];

export const visualizerRegistry: Partial<
  Record<VisualizerType, React.ComponentType<VisualizerProps>>
> = {};
