import type { Metadata } from "next";
import Link from "next/link";
import { QueueVisualizer } from "@/components/visualizers/queue/queue-visualizer";

export const metadata: Metadata = {
  title: "Queue visualizer",
  description:
    "Play with an interactive queue: enqueue, dequeue and peek step by step with highlighted pseudocode.",
  alternates: { canonical: "/visualizers/queue" },
};

const PRESET = {
  initial: ["Asha", "Ravi"],
  ops: ["enqueue Meera", "peek", "dequeue", "enqueue Kabir", "dequeue", "isEmpty"],
};

export default function QueueVisualizerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-primary text-sm font-semibold">
        <Link href="/visualizers" className="underline-offset-4 hover:underline">
          Visualizers
        </Link>
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Queue: the chai stall line
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Enqueue joins the back. Dequeue serves the front. Peek just looks. First in, first out.
      </p>
      <div className="mt-8">
        <QueueVisualizer initial={PRESET.initial} ops={PRESET.ops} title="Chai stall queue" />
      </div>
    </div>
  );
}
