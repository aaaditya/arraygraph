import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type LoopOp =
  | { kind: "sum"; n: number }
  | { kind: "count"; n: number }
  | { kind: "plates"; n: number };

export type LoopStepperFrame = BaseFrame & {
  kind: LoopOp["kind"] | "idle";
  i: number;
  n: number;
  total: number;
  items: { id: number; done: boolean; focus: boolean }[];
  opIndex: number;
};

export const LOOP_STEPPER_PSEUDOCODE: PseudocodeLine[] = [
  { text: "total = 0", indent: 0 },
  { text: "i = 1", indent: 0 },
  { text: "while i <= n:", indent: 0 },
  { text: "total = total + i", indent: 1 },
  { text: "i = i + 1", indent: 1 },
  { text: "return total", indent: 0 },
];

export const LINE = {
  initTotal: 0,
  initI: 1,
  whileCheck: 2,
  add: 3,
  bump: 4,
  ret: 5,
} as const;

const MAX_N = 12;

/** Parses "sum 5", "count 10", "plates 10". */
export function parseLoopOps(raw: string[]): ParseResult<LoopOp[]> {
  const ops: LoopOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim();
    if (!text) return;
    const [command = "", arg = "", extra] = text.split(/\s+/);
    const n = Number(arg);
    if (extra || !arg || !Number.isInteger(n) || n < 1 || n > MAX_N) {
      errors.push(
        `Step ${index + 1}: use "sum N", "count N" or "plates N" with N from 1 to ${MAX_N}.`,
      );
      return;
    }
    switch (command.toLowerCase()) {
      case "sum":
        ops.push({ kind: "sum", n });
        break;
      case "count":
        ops.push({ kind: "count", n });
        break;
      case "plates":
      case "wash":
        ops.push({ kind: "plates", n });
        break;
      default:
        errors.push(
          `Step ${index + 1}: unknown operation "${command}". Use sum, count or plates.`,
        );
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

function makeItems(n: number, current: number, doneThrough: number) {
  return Array.from({ length: n }, (_, index) => {
    const id = index + 1;
    return {
      id,
      done: id <= doneThrough,
      focus: id === current,
    };
  });
}

export function buildLoopStepperFrames(
  _initial: unknown[],
  ops: LoopOp[],
): LoopStepperFrame[] {
  const frames: LoopStepperFrame[] = [
    {
      line: -1,
      caption: "A loop repeats the same idea until a stop rule says stop.",
      status: "idle",
      kind: "idle",
      i: 0,
      n: 0,
      total: 0,
      items: [],
      opIndex: -1,
    },
  ];

  ops.forEach((op, opIndex) => {
    let total = 0;
    const noun =
      op.kind === "plates" ? "plate" : op.kind === "count" ? "count" : "number";

    frames.push({
      line: LINE.initTotal,
      caption:
        op.kind === "plates"
          ? `Start washing. There are ${op.n} plates.`
          : op.kind === "count"
            ? `Count from 1 to ${op.n}.`
            : `Add numbers from 1 to ${op.n}. total starts at 0.`,
      status: "ok",
      kind: op.kind,
      i: 0,
      n: op.n,
      total: 0,
      items: makeItems(op.n, 0, 0),
      opIndex,
    });
    frames.push({
      line: LINE.initI,
      caption: `Set i = 1. We begin with the first ${noun}.`,
      status: "ok",
      kind: op.kind,
      i: 1,
      n: op.n,
      total: 0,
      items: makeItems(op.n, 1, 0),
      opIndex,
    });

    for (let i = 1; i <= op.n; i += 1) {
      frames.push({
        line: LINE.whileCheck,
        caption: `Is i (${i}) ≤ ${op.n}? Yes — keep going.`,
        status: "ok",
        kind: op.kind,
        i,
        n: op.n,
        total,
        items: makeItems(op.n, i, i - 1),
        opIndex,
      });

      if (op.kind === "sum") {
        total += i;
        frames.push({
          line: LINE.add,
          caption: `total = ${total - i} + ${i} → ${total}`,
          status: "ok",
          kind: op.kind,
          i,
          n: op.n,
          total,
          items: makeItems(op.n, i, i),
          opIndex,
        });
      } else if (op.kind === "plates") {
        total = i;
        frames.push({
          line: LINE.add,
          caption: `Wash plate ${i}. Put it on the clean pile.`,
          status: "ok",
          kind: op.kind,
          i,
          n: op.n,
          total,
          items: makeItems(op.n, i, i),
          opIndex,
        });
      } else {
        total = i;
        frames.push({
          line: LINE.add,
          caption: `Say ${i}. Counted so far: ${i}.`,
          status: "ok",
          kind: op.kind,
          i,
          n: op.n,
          total,
          items: makeItems(op.n, i, i),
          opIndex,
        });
      }

      if (i < op.n) {
        frames.push({
          line: LINE.bump,
          caption: `i becomes ${i + 1}.`,
          status: "ok",
          kind: op.kind,
          i: i + 1,
          n: op.n,
          total,
          items: makeItems(op.n, i + 1, i),
          opIndex,
        });
      }
    }

    frames.push({
      line: LINE.whileCheck,
      caption: `Is i (${op.n + 1}) ≤ ${op.n}? No — stop the loop.`,
      status: "ok",
      kind: op.kind,
      i: op.n + 1,
      n: op.n,
      total,
      items: makeItems(op.n, 0, op.n),
      opIndex,
    });
    frames.push({
      line: LINE.ret,
      caption:
        op.kind === "sum"
          ? `Done. The sum is ${total}.`
          : op.kind === "plates"
            ? `Done. All ${op.n} plates are clean.`
            : `Done. We counted to ${op.n}.`,
      status: "ok",
      kind: op.kind,
      i: op.n + 1,
      n: op.n,
      total,
      items: makeItems(op.n, 0, op.n),
      opIndex,
    });
  });

  return frames;
}
