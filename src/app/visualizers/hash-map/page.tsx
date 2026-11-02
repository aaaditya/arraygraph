import type { Metadata } from "next";
import Link from "next/link";
import { HashMapVisualizer } from "@/components/visualizers/hash-map/hash-map-visualizer";

export const metadata: Metadata = {
  title: "Hash map visualizer",
  description:
    "Set, get and delete keys in a chaining hash map with seven buckets and highlighted pseudocode.",
  alternates: { canonical: "/visualizers/hash-map" },
};

const PRESET = {
  initial: ["a:1", "h:8"],
  ops: ["set b 2", "get a", "set a 9", "delete h", "get z"],
};

export default function HashMapVisualizerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-primary text-sm font-semibold">
        <Link href="/visualizers" className="underline-offset-4 hover:underline">
          Visualizers
        </Link>
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Hash map: cupboard shelves
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Hash the first character into one of seven shelves, then chain collisions. Set, get, or
        delete a key.
      </p>
      <div className="mt-8">
        <HashMapVisualizer initial={PRESET.initial} ops={PRESET.ops} title="School cupboard" />
      </div>
    </div>
  );
}
