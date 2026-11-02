import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type BinarySearchOp = { kind: "search"; target: number };

export type BinarySearchFrame = BaseFrame & {
  values: number[];
  lo: number;
  hi: number;
  mid?: number;
  /** Indices still inside the active search window. */
  active: number[];
  foundIndex?: number;
  output?: string;
  opIndex: number;
};

export const BINARY_SEARCH_PSEUDOCODE: PseudocodeLine[] = [
  { text: "binary_search(arr, target):", indent: 0 },
  { text: "lo = 0; hi = n - 1", indent: 1 },
  { text: "while lo <= hi:", indent: 1 },
  { text: "mid = (lo + hi) // 2", indent: 2 },
  { text: "if arr[mid] == target: return mid", indent: 2 },
  { text: "if arr[mid] < target: lo = mid + 1", indent: 2 },
  { text: "else: hi = mid - 1", indent: 2 },
  { text: "return not found", indent: 1 },
];

export const LINE = {
  header: 0,
  init: 1,
  whileCheck: 2,
  mid: 3,
  equal: 4,
  goRight: 5,
  goLeft: 6,
  notFound: 7,
} as const;

/** Parses strings such as "search 7" (case-insensitive). */
export function parseBinarySearchOps(raw: string[]): ParseResult<BinarySearchOp[]> {
  const ops: BinarySearchOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim();
    if (!text) return;
    const [command = "", ...rest] = text.split(/\s+/);
    const argument = rest.join(" ");
    switch (command.toLowerCase()) {
      case "search":
      case "find":
        if (!argument) {
          errors.push(`Step ${index + 1}: "search" needs a target, like "search 7"`);
          break;
        }
        {
          const target = Number(argument);
          if (!Number.isFinite(target))
            errors.push(`Step ${index + 1}: target must be a number, got "${argument}"`);
          else ops.push({ kind: "search", target });
        }
        break;
      default:
        errors.push(`Step ${index + 1}: unknown operation "${command}". Use search TARGET`);
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

function toSortedNumbers(initial: readonly unknown[]): number[] {
  const numbers = initial.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  return [...numbers].sort((a, b) => a - b);
}

function activeRange(lo: number, hi: number, length: number): number[] {
  if (lo > hi || length === 0) return [];
  const start = Math.max(0, lo);
  const end = Math.min(length - 1, hi);
  const indices: number[] = [];
  for (let i = start; i <= end; i++) indices.push(i);
  return indices;
}

/**
 * Turns a sorted array and search operations into animation frames
 * showing lo / mid / hi narrowing on each step.
 */
export function buildBinarySearchFrames(
  initial: readonly unknown[],
  ops: readonly BinarySearchOp[],
): BinarySearchFrame[] {
  const values = toSortedNumbers(initial);
  const frames: BinarySearchFrame[] = [
    {
      values,
      lo: 0,
      hi: Math.max(values.length - 1, -1),
      active: values.map((_, i) => i),
      line: -1,
      caption:
        values.length === 0
          ? "Start. The array is empty."
          : `Start. Sorted array: [${values.join(", ")}].`,
      status: "idle",
      opIndex: -1,
    },
  ];

  ops.forEach((op, opIndex) => {
    if (values.length === 0) {
      frames.push({
        values,
        lo: 0,
        hi: -1,
        active: [],
        line: LINE.notFound,
        caption: `search(${op.target}): the array is empty, so the target is not found.`,
        output: "not found",
        status: "error",
        opIndex,
      });
      return;
    }

    let lo = 0;
    let hi = values.length - 1;
    frames.push({
      values,
      lo,
      hi,
      active: activeRange(lo, hi, values.length),
      line: LINE.init,
      caption: `search(${op.target}): set lo = 0 and hi = ${hi}.`,
      status: "ok",
      opIndex,
    });

    let found = false;
    while (lo <= hi) {
      frames.push({
        values,
        lo,
        hi,
        active: activeRange(lo, hi, values.length),
        line: LINE.whileCheck,
        caption: `While lo (${lo}) ≤ hi (${hi}): keep searching.`,
        status: "ok",
        opIndex,
      });

      const mid = Math.floor((lo + hi) / 2);
      const midValue = values[mid]!;
      frames.push({
        values,
        lo,
        hi,
        mid,
        active: activeRange(lo, hi, values.length),
        line: LINE.mid,
        caption: `mid = (${lo} + ${hi}) // 2 = ${mid}. arr[mid] = ${midValue}.`,
        status: "ok",
        opIndex,
      });

      if (midValue === op.target) {
        frames.push({
          values,
          lo,
          hi,
          mid,
          active: [mid],
          foundIndex: mid,
          line: LINE.equal,
          caption: `arr[mid] equals ${op.target}. Found at index ${mid}.`,
          output: String(mid),
          status: "ok",
          opIndex,
        });
        found = true;
        break;
      }

      if (midValue < op.target) {
        frames.push({
          values,
          lo,
          hi,
          mid,
          active: activeRange(lo, hi, values.length),
          line: LINE.goRight,
          caption: `${midValue} < ${op.target}, so discard the left half. lo becomes ${mid + 1}.`,
          status: "ok",
          opIndex,
        });
        lo = mid + 1;
      } else {
        frames.push({
          values,
          lo,
          hi,
          mid,
          active: activeRange(lo, hi, values.length),
          line: LINE.goLeft,
          caption: `${midValue} > ${op.target}, so discard the right half. hi becomes ${mid - 1}.`,
          status: "ok",
          opIndex,
        });
        hi = mid - 1;
      }
    }

    if (!found) {
      frames.push({
        values,
        lo,
        hi,
        active: [],
        line: LINE.notFound,
        caption: `lo (${lo}) > hi (${hi}). ${op.target} is not in the array.`,
        output: "not found",
        status: "error",
        opIndex,
      });
    }
  });

  return frames;
}
