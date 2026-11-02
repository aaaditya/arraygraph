import type { Metadata } from "next";
import Link from "next/link";
import { GraphVisualizer } from "@/components/visualizers/graph/graph-visualizer";

export const metadata: Metadata = {
  title: "Graph visualizer",
  description:
    "Watch BFS and DFS explore an undirected graph with visited set, frontier, and highlighted pseudocode.",
  alternates: { canonical: "/visualizers/graph" },
};

const PRESET = {
  initial: ["A-B", "B-C", "A-D", "D-E"],
  ops: ["bfs A"],
};

export default function GraphVisualizerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-primary text-sm font-semibold">
        <Link href="/visualizers" className="underline-offset-4 hover:underline">
          Visualizers
        </Link>
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Graphs: ripples and caves
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        BFS spreads like ripples (queue). DFS plunges into caves (stack). Watch the visited set and
        frontier grow.
      </p>
      <div className="mt-8">
        <GraphVisualizer initial={PRESET.initial} ops={PRESET.ops} title="BFS from A" />
      </div>
    </div>
  );
}
