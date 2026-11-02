import type { Metadata } from "next";
import Link from "next/link";
import { LinkedListVisualizer } from "@/components/visualizers/linked-list/linked-list-visualizer";

export const metadata: Metadata = {
  title: "Linked list visualizer",
  description:
    "Append, prepend, delete and reverse a singly linked list step by step with highlighted pseudocode.",
  alternates: { canonical: "/visualizers/linked-list" },
};

const PRESET = {
  initial: ["A", "B", "C"],
  ops: ["append D", "prepend Z", "delete B", "reverse"],
};

export default function LinkedListVisualizerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-primary text-sm font-semibold">
        <Link href="/visualizers" className="underline-offset-4 hover:underline">
          Visualizers
        </Link>
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Linked list: treasure hunt clues
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Each node points to the next. Append at the tail, prepend at the head, delete by value, or
        reverse every arrow.
      </p>
      <div className="mt-8">
        <LinkedListVisualizer initial={PRESET.initial} ops={PRESET.ops} title="Clue chain" />
      </div>
    </div>
  );
}
