import type { Metadata } from "next";
import Link from "next/link";
import { StackPlayground } from "@/components/visualizers/stack/stack-playground";

export const metadata: Metadata = {
  title: "Stack visualizer",
  description:
    "Play with an interactive stack: push, pop and peek step by step with highlighted pseudocode and keyboard controls.",
  alternates: { canonical: "/visualizers/stack" },
};

export default function StackVisualizerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-primary text-sm font-semibold">
        <Link href="/visualizers" className="underline-offset-4 hover:underline">
          Visualizers
        </Link>
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        Stack: the pile of plates
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Push puts a plate on top. Pop takes the top plate. Peek just looks. Try your own steps
        below, or{" "}
        <Link
          href="/learn/stack-basics"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          read the Stack lesson
        </Link>
        .
      </p>
      <div className="mt-8">
        <StackPlayground />
      </div>
    </div>
  );
}
