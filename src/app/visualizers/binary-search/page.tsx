import type { Metadata } from "next";
import Link from "next/link";
import { BinarySearchVisualizer } from "@/components/visualizers/binary-search/binary-search-visualizer";

export const metadata: Metadata = {
  title: "Binary search visualizer",
  description:
    "Watch binary search narrow lo, mid and hi on a sorted array with highlighted pseudocode.",
  alternates: { canonical: "/visualizers/binary-search" },
};

const PRESET = {
  initial: [1, 3, 5, 7, 9, 11, 13],
  ops: ["search 11"],
};

export default function BinarySearchVisualizerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-primary text-sm font-semibold">
        <Link href="/visualizers" className="underline-offset-4 hover:underline">
          Visualizers
        </Link>
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Binary search: guess the number
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Start in the middle. Discard half the sorted list each step until you find the target — or
        run out of room.
      </p>
      <div className="mt-8">
        <BinarySearchVisualizer initial={PRESET.initial} ops={PRESET.ops} title="Search for 11" />
      </div>
    </div>
  );
}
