import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type StepRunnerOp = { kind: "run" } | { kind: "reset" };

export type StepRunnerFrame = BaseFrame & {
  steps: string[];
  /** Index of the step currently being done; -1 before start. */
  current: number;
  done: boolean;
  opIndex: number;
};

export const STEP_RUNNER_PSEUDOCODE: PseudocodeLine[] = [
  { text: "for each step in the list:", indent: 0 },
  { text: "do that step exactly", indent: 1 },
  { text: "then go to the next step", indent: 1 },
  { text: "when the list ends, stop", indent: 0 },
];

export const LINE = {
  forEach: 0,
  doStep: 1,
  next: 2,
  stop: 3,
} as const;

const MAX_STEPS = 12;
const MAX_STEP_LENGTH = 40;

/** Parses ops like "run" (play every step) or "reset". Empty ops default to a single run. */
export function parseStepRunnerOps(raw: string[]): ParseResult<StepRunnerOp[]> {
  if (raw.length === 0) return { ok: true, value: [{ kind: "run" }] };
  const ops: StepRunnerOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim().toLowerCase();
    if (!text) return;
    if (text === "run" || text === "play" || text === "start") ops.push({ kind: "run" });
    else if (text === "reset") ops.push({ kind: "reset" });
    else errors.push(`Step ${index + 1}: unknown operation "${entry}". Use run or reset.`);
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

export function normalizeSteps(initial: unknown[]): string[] {
  return initial
    .map((value) => String(value).trim())
    .filter(Boolean)
    .slice(0, MAX_STEPS)
    .map((step) =>
      step.length > MAX_STEP_LENGTH ? `${step.slice(0, MAX_STEP_LENGTH - 1)}…` : step,
    );
}

export function buildStepRunnerFrames(initial: unknown[], ops: StepRunnerOp[]): StepRunnerFrame[] {
  const steps = normalizeSteps(initial);
  const frames: StepRunnerFrame[] = [
    {
      line: -1,
      caption:
        steps.length === 0
          ? "No steps yet. Add a list of clear instructions."
          : `Ready. The robot has ${steps.length} step${steps.length === 1 ? "" : "s"} to follow.`,
      status: "idle",
      steps,
      current: -1,
      done: false,
      opIndex: -1,
    },
  ];

  ops.forEach((op, opIndex) => {
    if (op.kind === "reset") {
      frames.push({
        line: -1,
        caption: "Reset. Back to the start of the list.",
        status: "idle",
        steps,
        current: -1,
        done: false,
        opIndex,
      });
      return;
    }

    if (steps.length === 0) {
      frames.push({
        line: LINE.stop,
        caption: "There are no steps to run.",
        status: "error",
        steps,
        current: -1,
        done: true,
        opIndex,
      });
      return;
    }

    steps.forEach((step, index) => {
      frames.push({
        line: LINE.doStep,
        caption: `Step ${index + 1}: ${step}`,
        status: "ok",
        steps,
        current: index,
        done: false,
        opIndex,
      });
      if (index < steps.length - 1) {
        frames.push({
          line: LINE.next,
          caption: "Done. Moving to the next step.",
          status: "ok",
          steps,
          current: index,
          done: false,
          opIndex,
        });
      }
    });

    frames.push({
      line: LINE.stop,
      caption: "All steps finished. The robot stops.",
      status: "ok",
      steps,
      current: steps.length - 1,
      done: true,
      opIndex,
    });
  });

  return frames;
}
