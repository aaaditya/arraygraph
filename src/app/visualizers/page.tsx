import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Visualizers",
  description: "Interactive, keyboard-friendly visualizers for data structures and algorithms.",
  alternates: { canonical: "/visualizers" },
};

const visualizers = [
  { slug: "stack", title: "Stack", analogy: "Pile of plates", ready: true },
  { slug: "queue", title: "Queue", analogy: "Chai stall line", ready: false },
  { slug: "linked-list", title: "Linked list", analogy: "Treasure hunt clues", ready: false },
  { slug: "hash-map", title: "Hash map", analogy: "School cupboard shelves", ready: false },
  { slug: "binary-search", title: "Binary search", analogy: "Guess the number", ready: false },
  { slug: "tree", title: "Trees", analogy: "Family tree", ready: false },
  { slug: "graph", title: "Graphs: BFS and DFS", analogy: "Ripples and caves", ready: false },
  { slug: "sorting", title: "Sorting", analogy: "Arranging playing cards", ready: false },
];

export default function VisualizersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Visualizers</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Play, pause and step through every idea. Each one highlights the pseudocode line it is
        running.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visualizers.map((visualizer) => (
          <li key={visualizer.slug}>
            {visualizer.ready ? (
              <Link
                href={`/visualizers/${visualizer.slug}`}
                className="bg-card hover:border-primary focus-visible:ring-ring/50 flex h-full flex-col gap-2 rounded-xl border p-5 transition-colors outline-none focus-visible:ring-[3px]"
              >
                <span className="font-semibold">{visualizer.title}</span>
                <span className="text-muted-foreground text-sm">{visualizer.analogy}</span>
                <Badge variant="success">Ready</Badge>
              </Link>
            ) : (
              <div className="flex h-full flex-col gap-2 rounded-xl border border-dashed p-5">
                <span className="font-semibold">{visualizer.title}</span>
                <span className="text-muted-foreground text-sm">{visualizer.analogy}</span>
                <Badge variant="secondary">Coming soon</Badge>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
