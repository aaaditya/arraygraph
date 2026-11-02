"use client";

import { PencilIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Normalises answers so "[1, 3]", "1,3" and " [ 1 ,3 ] " are treated as the same. */
export function normalizeTraceAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[\s[\]()'"]/g, "")
    .replace(/,+$/, "");
}

export function Trace({
  title = "Trace this by hand",
  input,
  answer,
  hint,
  answerLabel = "What does it look like at the end?",
}: {
  title?: string;
  input: string;
  answer: string;
  hint?: string;
  answerLabel?: string;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [revealed, setRevealed] = useState(false);

  function check() {
    setResult(normalizeTraceAnswer(value) === normalizeTraceAnswer(answer) ? "correct" : "wrong");
  }

  return (
    <section aria-label={title} className="bg-card my-6 rounded-xl border p-5">
      <p className="text-primary flex items-center gap-2 text-sm font-semibold">
        <PencilIcon className="size-4" aria-hidden="true" /> {title}
      </p>
      <p className="mt-3">Grab a pen. Start from empty and apply these steps in order:</p>
      <p className="bg-muted mt-2 rounded-lg p-3 font-mono text-sm">{input}</p>
      {hint ? <p className="text-muted-foreground mt-2 text-sm">Hint: {hint}</p> : null}
      <form
        className="mt-4 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          check();
        }}
      >
        <Label htmlFor={id}>{answerLabel}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={id}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setResult(null);
            }}
            placeholder="for example [1, 2]"
            autoComplete="off"
            className={cn(
              result === "correct" && "border-success",
              result === "wrong" && "border-destructive",
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={!value.trim()}>
              Check
            </Button>
            <Button type="button" variant="outline" onClick={() => setRevealed(true)}>
              Show answer
            </Button>
          </div>
        </div>
      </form>
      <div aria-live="polite" className="mt-2 text-sm">
        {result === "correct" ? (
          <p className="text-success font-medium">Spot on. You traced it perfectly.</p>
        ) : null}
        {result === "wrong" ? (
          <p className="text-destructive font-medium">
            Not yet. Redo it one step at a time and draw the state after each step.
          </p>
        ) : null}
        {revealed ? (
          <p>
            Answer: <code className="bg-muted rounded px-1.5 py-0.5 font-mono">{answer}</code>
          </p>
        ) : null}
      </div>
    </section>
  );
}
