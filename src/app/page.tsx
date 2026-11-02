import {
  BookOpenIcon,
  BrainCircuitIcon,
  CodeIcon,
  HandIcon,
  LightbulbIcon,
  NetworkIcon,
  PlayCircleIcon,
  PuzzleIcon,
  TrophyIcon,
  UtensilsIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const flow = [
  { icon: LightbulbIcon, title: "Real-life analogy", text: "A pile of plates. A chai stall line." },
  {
    icon: PlayCircleIcon,
    title: "Animated visual",
    text: "Watch the idea move, one step at a time.",
  },
  { icon: HandIcon, title: "Hand-trace", text: "Predict the next state before you see it." },
  { icon: CodeIcon, title: "Guided code", text: "Only now: code in five languages." },
  { icon: PuzzleIcon, title: "Practice", text: "Interview problems, hints and solutions." },
  { icon: TrophyIcon, title: "Recap quiz", text: "Lock it in, then review on a schedule." },
];

const tracks = [
  {
    icon: BookOpenIcon,
    title: "DSA Core",
    text: "Arrays to dynamic programming, with a visualizer for every structure.",
  },
  {
    icon: BrainCircuitIcon,
    title: "15 Interview Patterns",
    text: "Clue cards that tell you which pattern a problem needs.",
  },
  {
    icon: UtensilsIcon,
    title: "System Design",
    text: "A restaurant analogy for caches, queues, load balancers and more.",
  },
  {
    icon: NetworkIcon,
    title: "Competitive Programming",
    text: "Constraints, templates and contest strategy from 800 to 1600.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:pt-24">
        <Badge variant="secondary" className="mb-6">
          Analogy first. Visuals second. Code last.
        </Badge>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
          Learn DSA the way you would teach a child.
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg text-pretty">
          Every idea starts with a story you already know, becomes a picture you can play with, and
          only then turns into code. Then we get you interview ready.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/learn/stack-basics">Start with the Stack lesson</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/visualizers/stack">Play with a visualizer</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="flow-heading" className="mx-auto max-w-6xl px-4 py-12">
        <h2 id="flow-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Every lesson follows the same six steps
        </h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flow.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <step.icon className="text-primary size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="mt-2">{step.title}</CardTitle>
                  <CardDescription>{step.text}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="tracks-heading" className="mx-auto max-w-6xl px-4 py-12">
        <h2 id="tracks-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
          What you can learn
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {tracks.map((track) => (
            <li key={track.title}>
              <Card className="h-full">
                <CardHeader>
                  <track.icon className="text-primary size-6" aria-hidden="true" />
                  <CardTitle className="mt-2 text-lg">{track.title}</CardTitle>
                  <CardDescription>{track.text}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
