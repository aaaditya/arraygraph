import type { Metadata } from "next";
import Link from "next/link";
import { SortingVisualizer } from "@/components/visualizers/sorting/sorting-visualizer";

export const metadata: Metadata = {
  title: "Sorting visualizer",
  description:
    "Watch bubble, selection or insertion sort compare and swap values with highlighted pseudocode.",
  alternates: { canonical: "/visualizers/sorting" },
};

const PRESET = {
  initial: [5, 2, 8, 1, 4],
  ops: ["bubble"],
};

export default function SortingVisualizerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-primary text-sm font-semibold">
        <Link href="/visualizers" className="underline-offset-4 hover:underline">
          Visualizers
        </Link>
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Sorting: arranging cards
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Bubble, selection, or insertion — one algorithm per run. Watch comparisons and swaps light
        up.
      </p>
      <div className="mt-8">
        <SortingVisualizer initial={PRESET.initial} ops={PRESET.ops} title="Bubble sort" />
      </div>
    </div>
  );
}
