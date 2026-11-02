import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type SortingOp = { kind: "bubble" | "selection" | "insertion" };

export type SortingFrame = BaseFrame & {
  values: number[];
  /** Indices currently being compared. */
  comparing?: [number, number];
  /** Indices being swapped. */
  swapping?: [number, number];
  /** Sorted / fixed prefix or region markers. */
  sorted: number[];
  /** For insertion: the key being placed. */
  keyIndex?: number;
  output?: string;
  opIndex: number;
  algorithm: SortingOp["kind"] | null;
};

export const SORTING_PSEUDOCODE: PseudocodeLine[] = [
  { text: "bubble / selection / insertion sort:", indent: 0 },
  { text: "for each pass over the array:", indent: 1 },
  { text: "compare a pair of elements", indent: 2 },
  { text: "swap (or shift) when out of order", indent: 2 },
  { text: "mark the fixed position as sorted", indent: 2 },
  { text: "array is sorted", indent: 1 },
];

export const LINE = {
  header: 0,
  pass: 1,
  compare: 2,
  swap: 3,
  mark: 4,
  done: 5,
} as const;

/** Parses a single algorithm name per run: bubble | selection | insertion. */
export function parseSortingOps(raw: string[]): ParseResult<SortingOp[]> {
  const ops: SortingOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim();
    if (!text) return;
    const [command = "", ...rest] = text.split(/\s+/);
    if (rest.length) {
      errors.push(`Step ${index + 1}: "${command}" does not take arguments`);
      return;
    }
    switch (command.toLowerCase()) {
      case "bubble":
      case "bubblesort":
        ops.push({ kind: "bubble" });
        break;
      case "selection":
      case "selectionsort":
        ops.push({ kind: "selection" });
        break;
      case "insertion":
      case "insertionsort":
        ops.push({ kind: "insertion" });
        break;
      default:
        errors.push(
          `Step ${index + 1}: unknown algorithm "${command}". Use bubble, selection or insertion`,
        );
    }
  });
  if (ops.length > 1) {
    return {
      ok: false,
      errors: ["Run one sorting algorithm at a time (bubble, selection, or insertion)."],
    };
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

function toNumbers(initial: readonly unknown[]): number[] {
  return initial.map((value) => Number(value)).filter((value) => Number.isFinite(value));
}

function pushDone(
  frames: SortingFrame[],
  values: number[],
  algorithm: SortingOp["kind"],
  opIndex: number,
) {
  frames.push({
    values: [...values],
    sorted: values.map((_, i) => i),
    line: LINE.done,
    caption: `${algorithm} sort complete: [${values.join(", ")}].`,
    output: values.join(", "),
    status: "ok",
    opIndex,
    algorithm,
  });
}

function runBubble(values: number[], opIndex: number, frames: SortingFrame[]) {
  const n = values.length;
  const sorted = new Set<number>();
  frames.push({
    values: [...values],
    sorted: [],
    line: LINE.pass,
    caption: "Bubble sort: larger values bubble toward the end each pass.",
    status: "ok",
    opIndex,
    algorithm: "bubble",
  });

  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false;
    for (let i = 0; i < n - 1 - pass; i++) {
      const j = i + 1;
      frames.push({
        values: [...values],
        comparing: [i, j],
        sorted: [...sorted],
        line: LINE.compare,
        caption: `Compare ${values[i]} and ${values[j]}.`,
        status: "ok",
        opIndex,
        algorithm: "bubble",
      });
      if (values[i]! > values[j]!) {
        frames.push({
          values: [...values],
          swapping: [i, j],
          sorted: [...sorted],
          line: LINE.swap,
          caption: `${values[i]} > ${values[j]}, so swap them.`,
          status: "ok",
          opIndex,
          algorithm: "bubble",
        });
        const tmp = values[i]!;
        values[i] = values[j]!;
        values[j] = tmp;
        swapped = true;
        frames.push({
          values: [...values],
          swapping: [i, j],
          sorted: [...sorted],
          line: LINE.swap,
          caption: `Swapped. Array is now [${values.join(", ")}].`,
          status: "ok",
          opIndex,
          algorithm: "bubble",
        });
      }
    }
    sorted.add(n - 1 - pass);
    frames.push({
      values: [...values],
      sorted: [...sorted],
      line: LINE.mark,
      caption: `Index ${n - 1 - pass} is fixed after this pass.`,
      status: "ok",
      opIndex,
      algorithm: "bubble",
    });
    if (!swapped) break;
  }
  pushDone(frames, values, "bubble", opIndex);
}

function runSelection(values: number[], opIndex: number, frames: SortingFrame[]) {
  const n = values.length;
  const sorted = new Set<number>();
  frames.push({
    values: [...values],
    sorted: [],
    line: LINE.pass,
    caption: "Selection sort: pick the minimum of the unsorted suffix each pass.",
    status: "ok",
    opIndex,
    algorithm: "selection",
  });

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      frames.push({
        values: [...values],
        comparing: [min, j],
        sorted: [...sorted],
        line: LINE.compare,
        caption: `Is ${values[j]} smaller than current min ${values[min]}?`,
        status: "ok",
        opIndex,
        algorithm: "selection",
      });
      if (values[j]! < values[min]!) min = j;
    }
    if (min !== i) {
      frames.push({
        values: [...values],
        swapping: [i, min],
        sorted: [...sorted],
        line: LINE.swap,
        caption: `Swap index ${i} (${values[i]}) with min at ${min} (${values[min]}).`,
        status: "ok",
        opIndex,
        algorithm: "selection",
      });
      const tmp = values[i]!;
      values[i] = values[min]!;
      values[min] = tmp;
    }
    sorted.add(i);
    frames.push({
      values: [...values],
      sorted: [...sorted],
      line: LINE.mark,
      caption: `Index ${i} is now sorted.`,
      status: "ok",
      opIndex,
      algorithm: "selection",
    });
  }
  if (n > 0) sorted.add(n - 1);
  pushDone(frames, values, "selection", opIndex);
}

function runInsertion(values: number[], opIndex: number, frames: SortingFrame[]) {
  const n = values.length;
  const sorted = new Set<number>(n > 0 ? [0] : []);
  frames.push({
    values: [...values],
    sorted: [...sorted],
    line: LINE.pass,
    caption: "Insertion sort: grow a sorted prefix by inserting each next key.",
    status: "ok",
    opIndex,
    algorithm: "insertion",
  });

  for (let i = 1; i < n; i++) {
    const key = values[i]!;
    let j = i - 1;
    frames.push({
      values: [...values],
      keyIndex: i,
      sorted: [...sorted],
      line: LINE.compare,
      caption: `Take key ${key} at index ${i} and find its place in the sorted prefix.`,
      status: "ok",
      opIndex,
      algorithm: "insertion",
    });
    while (j >= 0 && values[j]! > key) {
      frames.push({
        values: [...values],
        comparing: [j, j + 1],
        keyIndex: j + 1,
        sorted: [...sorted],
        line: LINE.compare,
        caption: `${values[j]} > ${key}, so shift ${values[j]} right.`,
        status: "ok",
        opIndex,
        algorithm: "insertion",
      });
      values[j + 1] = values[j]!;
      frames.push({
        values: [...values],
        swapping: [j, j + 1],
        keyIndex: j,
        sorted: [...sorted],
        line: LINE.swap,
        caption: `Shifted. Hole is now at index ${j}.`,
        status: "ok",
        opIndex,
        algorithm: "insertion",
      });
      j -= 1;
    }
    values[j + 1] = key;
    for (let k = 0; k <= i; k++) sorted.add(k);
    frames.push({
      values: [...values],
      keyIndex: j + 1,
      sorted: [...sorted],
      line: LINE.mark,
      caption: `Placed ${key} at index ${j + 1}. Sorted prefix length ${i + 1}.`,
      status: "ok",
      opIndex,
      algorithm: "insertion",
    });
  }
  pushDone(frames, values, "insertion", opIndex);
}

export function buildSortingFrames(
  initial: readonly unknown[],
  ops: readonly SortingOp[],
): SortingFrame[] {
  const values = toNumbers(initial);
  const frames: SortingFrame[] = [
    {
      values: [...values],
      sorted: [],
      line: -1,
      caption:
        values.length === 0
          ? "Start. The array is empty."
          : `Start. Array: [${values.join(", ")}].`,
      status: "idle",
      opIndex: -1,
      algorithm: null,
    },
  ];

  if (ops.length === 0) return frames;

  const op = ops[0]!;
  const working = [...values];
  if (working.length <= 1) {
    pushDone(frames, working, op.kind, 0);
    return frames;
  }

  switch (op.kind) {
    case "bubble":
      runBubble(working, 0, frames);
      break;
    case "selection":
      runSelection(working, 0, frames);
      break;
    case "insertion":
      runInsertion(working, 0, frames);
      break;
  }

  return frames;
}

export function finalSortingValues(frames: readonly SortingFrame[]) {
  return frames.at(-1)?.values ?? [];
}
