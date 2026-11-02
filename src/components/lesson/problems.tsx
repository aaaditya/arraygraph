import { PuzzleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProblem } from "@/lib/content/loader";
import type { Problem } from "@/lib/content/schemas";
import { humanize } from "@/lib/content/catalog";

const difficultyVariant = {
  easy: "success",
  medium: "warning",
  hard: "destructive",
} as const;

function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <li className="bg-card rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">{problem.title}</h3>
        <Badge variant={difficultyVariant[problem.difficulty]}>
          {humanize(problem.difficulty)}
        </Badge>
        {problem.patterns.map((pattern) => (
          <Badge key={pattern} variant="outline">
            {humanize(pattern)}
          </Badge>
        ))}
      </div>
      {problem.analogy ? (
        <p className="text-muted-foreground mt-1 text-sm">Think of it as {problem.analogy}.</p>
      ) : null}
      <p className="mt-2 text-sm leading-6 whitespace-pre-line">{problem.statement}</p>
      <details className="mt-3 text-sm">
        <summary className="text-primary cursor-pointer font-medium">
          Hints ({problem.hints.length})
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {problem.hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      </details>
      <details className="mt-2 text-sm">
        <summary className="text-primary cursor-pointer font-medium">Solution approach</summary>
        <p className="mt-2 leading-6 whitespace-pre-line">{problem.solution.approach}</p>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          {problem.solution.complexity}
        </p>
      </details>
    </li>
  );
}

export async function Problems({ ids }: { ids: string[] }) {
  const problems = await Promise.all(
    ids.map(async (id) => ({ id, problem: await getProblem(id) })),
  );
  return (
    <section aria-label="Practice problems" className="my-6">
      <p className="text-primary mb-3 flex items-center gap-2 text-sm font-semibold">
        <PuzzleIcon className="size-4" aria-hidden="true" /> Practice problems
      </p>
      <ul className="grid gap-3">
        {problems.map(({ id, problem }) =>
          problem ? (
            <ProblemCard key={id} problem={problem} />
          ) : (
            <li key={id} className="text-muted-foreground rounded-xl border border-dashed p-4">
              {humanize(id)}: coming soon
            </li>
          ),
        )}
      </ul>
      <p className="text-muted-foreground mt-3 text-xs">
        The in-browser code editor with test cases arrives with Pattern Practice.
      </p>
    </section>
  );
}
