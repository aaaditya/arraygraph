"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseStackOps } from "@/lib/visualizers/stack/engine";
import { StackVisualizer } from "./stack-visualizer";

export const STACK_PRESETS = [
  {
    id: "basics",
    label: "Basics",
    initial: "3, 7",
    ops: "push 5\npeek\npop\npush 9\npop",
  },
  {
    id: "underflow",
    label: "Underflow",
    initial: "4",
    ops: "pop\npop\nisEmpty",
  },
  {
    id: "undo",
    label: "Undo history",
    initial: "",
    ops: "push type\npush bold\npush paste\npop\npop",
  },
] as const;

/** Splits "a, b, c" into values, ignoring blanks. */
export function parseInitialValues(text: string) {
  return text
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/** Accepts one operation per line or comma-separated operations. */
export function splitOps(text: string) {
  return text
    .split(/[\n,]/)
    .map((op) => op.trim())
    .filter(Boolean);
}

export function StackPlayground() {
  const initialId = useId();
  const opsId = useId();
  const errorId = useId();
  const [initialText, setInitialText] = useState<string>(STACK_PRESETS[0].initial);
  const [opsText, setOpsText] = useState<string>(STACK_PRESETS[0].ops);
  const [applied, setApplied] = useState({
    initial: parseInitialValues(STACK_PRESETS[0].initial),
    ops: splitOps(STACK_PRESETS[0].ops),
    run: 0,
  });

  const draftErrors = useMemo(() => {
    const errors: string[] = [];
    if (parseInitialValues(initialText).some((value) => value.length > 6)) {
      errors.push("Starting values must be 6 characters or fewer.");
    }
    const parsed = parseStackOps(splitOps(opsText));
    if (!parsed.ok) errors.push(...parsed.errors);
    return errors;
  }, [initialText, opsText]);

  function apply(initial: string, ops: string) {
    setApplied((previous) => ({
      initial: parseInitialValues(initial),
      ops: splitOps(ops),
      run: previous.run + 1,
    }));
  }

  return (
    <div className="grid gap-6">
      <StackVisualizer
        key={applied.run}
        initial={applied.initial}
        ops={applied.ops}
        title="Your stack"
      />

      <form
        className="bg-card grid gap-4 rounded-xl border p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (draftErrors.length === 0) apply(initialText, opsText);
        }}
        aria-describedby={draftErrors.length ? errorId : undefined}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Presets:</span>
          {STACK_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setInitialText(preset.initial);
                setOpsText(preset.ops);
                apply(preset.initial, preset.ops);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={initialId}>Starting stack (bottom to top, comma separated)</Label>
            <Input
              id={initialId}
              value={initialText}
              onChange={(event) => setInitialText(event.target.value)}
              placeholder="3, 7"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={opsId}>Operations (one per line)</Label>
            <Textarea
              id={opsId}
              value={opsText}
              onChange={(event) => setOpsText(event.target.value)}
              rows={5}
              className="font-mono"
              aria-invalid={draftErrors.length ? true : undefined}
              spellCheck={false}
            />
            <p className="text-muted-foreground text-xs">Use push x, pop, peek or isEmpty.</p>
          </div>
        </div>
        <div aria-live="polite">
          {draftErrors.length ? (
            <ul id={errorId} className="text-destructive list-disc pl-5 text-sm">
              {draftErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <Button type="submit" className="w-fit" disabled={draftErrors.length > 0}>
          Visualize
        </Button>
      </form>
    </div>
  );
}
