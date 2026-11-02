import type { PseudocodeLine } from "@/lib/visualizers/types";
import { cn } from "@/lib/utils";

export function PseudocodePanel({
  lines,
  activeLine,
  status,
}: {
  lines: PseudocodeLine[];
  activeLine: number;
  status: "idle" | "ok" | "error";
}) {
  return (
    <figure className="bg-muted/60 min-w-0 rounded-lg border p-3">
      <figcaption className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
        Pseudocode
      </figcaption>
      <ol className="font-mono text-xs leading-6 sm:text-sm">
        {lines.map((line, index) => {
          const active = index === activeLine;
          return (
            <li
              key={index}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex gap-3 rounded px-2 whitespace-pre transition-colors",
                active && status !== "error" && "bg-highlight text-foreground font-semibold",
                active && status === "error" && "bg-destructive/20 text-foreground font-semibold",
              )}
            >
              <span
                className="text-muted-foreground w-4 shrink-0 text-right select-none"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span style={{ paddingLeft: `${line.indent * 1.25}rem` }}>{line.text}</span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
