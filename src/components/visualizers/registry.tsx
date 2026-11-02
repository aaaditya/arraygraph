"use client";

import type * as React from "react";
import { BinarySearchVisualizer } from "./binary-search/binary-search-visualizer";
import { FlowchartVisualizer } from "./flowchart/flowchart-visualizer";
import { GraphVisualizer } from "./graph/graph-visualizer";
import { HashMapVisualizer } from "./hash-map/hash-map-visualizer";
import { LinkedListVisualizer } from "./linked-list/linked-list-visualizer";
import { LoopStepperVisualizer } from "./loop-stepper/loop-stepper-visualizer";
import { MemoryBoxesVisualizer } from "./memory-boxes/memory-boxes-visualizer";
import { QueueVisualizer } from "./queue/queue-visualizer";
import { SortingVisualizer } from "./sorting/sorting-visualizer";
import { StackVisualizer } from "./stack/stack-visualizer";
import { StepRunnerVisualizer } from "./step-runner/step-runner-visualizer";

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
  "step-runner",
  "memory-boxes",
  "flowchart",
  "loop-stepper",
] as const;

export type VisualizerType = (typeof VISUALIZER_TYPES)[number];

export const visualizerRegistry: Partial<
  Record<VisualizerType, React.ComponentType<VisualizerProps>>
> = {
  stack: StackVisualizer,
  queue: QueueVisualizer,
  "linked-list": LinkedListVisualizer,
  "hash-map": HashMapVisualizer,
  "binary-search": BinarySearchVisualizer,
  graph: GraphVisualizer,
  sorting: SortingVisualizer,
  "step-runner": StepRunnerVisualizer,
  "memory-boxes": MemoryBoxesVisualizer,
  flowchart: FlowchartVisualizer,
  "loop-stepper": LoopStepperVisualizer,
};
