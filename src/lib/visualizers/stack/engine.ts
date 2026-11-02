import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type StackOp =
  { kind: "push"; value: string } | { kind: "pop" } | { kind: "peek" } | { kind: "isEmpty" };

export type StackItem = { id: string; value: string };

export type StackFrame = BaseFrame & {
  items: StackItem[];
  /** Item being acted on, used for highlighting. */
  focusId?: string;
  focusKind?: "push" | "pop" | "peek";
  /** Value returned by the current operation, if any. */
  output?: string;
  /** Index of the operation this frame belongs to; -1 for the starting frame. */
  opIndex: number;
};

export const STACK_PSEUDOCODE: PseudocodeLine[] = [
  { text: "push(x):", indent: 0 },
  { text: "items.append(x)        # new plate on top", indent: 1 },
  { text: "pop():", indent: 0 },
  { text: "if is_empty(): error   # underflow", indent: 1 },
  { text: "x = items[top]", indent: 1 },
  { text: "remove top; return x", indent: 1 },
  { text: "peek():", indent: 0 },
  { text: "if is_empty(): error", indent: 1 },
  { text: "return items[top]      # look, don't take", indent: 1 },
  { text: "is_empty():", indent: 0 },
  { text: "return size == 0", indent: 1 },
];

export const LINE = {
  push: 0,
  append: 1,
  pop: 2,
  popCheck: 3,
  popRead: 4,
  popReturn: 5,
  peek: 6,
  peekCheck: 7,
  peekReturn: 8,
  isEmpty: 9,
  isEmptyReturn: 10,
} as const;

export const MAX_STACK_SIZE = 12;
const MAX_VALUE_LENGTH = 6;

/** Parses strings such as "push 5", "pop", "peek" and "isEmpty" (case-insensitive). */
export function parseStackOps(raw: string[]): ParseResult<StackOp[]> {
  const ops: StackOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim();
    if (!text) return;
    const [command = "", ...rest] = text.split(/\s+/);
    const argument = rest.join(" ");
    switch (command.toLowerCase()) {
      case "push":
        if (!argument) errors.push(`Step ${index + 1}: "push" needs a value, like "push 5"`);
        else if (argument.length > MAX_VALUE_LENGTH)
          errors.push(`Step ${index + 1}: keep values to ${MAX_VALUE_LENGTH} characters`);
        else ops.push({ kind: "push", value: argument });
        break;
      case "pop":
      case "peek":
        if (argument) errors.push(`Step ${index + 1}: "${command}" does not take a value`);
        else ops.push({ kind: command.toLowerCase() as "pop" | "peek" });
        break;
      case "isempty":
      case "is_empty":
        ops.push({ kind: "isEmpty" });
        break;
      default:
        errors.push(
          `Step ${index + 1}: unknown operation "${command}". Use push, pop, peek or isEmpty`,
        );
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

function describe(items: StackItem[]) {
  if (items.length === 0) return "The pile is empty.";
  const top = items[items.length - 1]!;
  return `Bottom to top: ${items.map((item) => item.value).join(", ")}. ${top.value} is on top.`;
}

/**
 * Turns a starting stack and a list of operations into animation frames.
 * Each operation becomes 1 to 3 frames so learners can follow every pseudocode line.
 */
export function buildStackFrames(
  initial: readonly unknown[],
  ops: readonly StackOp[],
): StackFrame[] {
  let nextId = 0;
  const makeItem = (value: unknown): StackItem => ({
    id: `plate-${nextId++}`,
    value: String(value),
  });

  let items = initial.slice(0, MAX_STACK_SIZE).map(makeItem);
  const frames: StackFrame[] = [
    {
      items,
      line: -1,
      caption: `Start. ${describe(items)}`,
      status: "idle",
      opIndex: -1,
    },
  ];

  ops.forEach((op, opIndex) => {
    const top = items[items.length - 1];
    switch (op.kind) {
      case "push": {
        if (items.length >= MAX_STACK_SIZE) {
          frames.push({
            items,
            line: LINE.push,
            caption: `The pile is full (${MAX_STACK_SIZE} plates). We cannot push ${op.value}. This is a stack overflow.`,
            status: "error",
            opIndex,
          });
          break;
        }
        frames.push({
          items,
          line: LINE.push,
          caption: `push(${op.value}): we want to put ${op.value} on the pile.`,
          status: "ok",
          opIndex,
        });
        const item = makeItem(op.value);
        items = [...items, item];
        frames.push({
          items,
          line: LINE.append,
          caption: `${op.value} goes on top. ${describe(items)}`,
          focusId: item.id,
          focusKind: "push",
          status: "ok",
          opIndex,
        });
        break;
      }
      case "pop": {
        if (!top) {
          frames.push({
            items,
            line: LINE.popCheck,
            caption:
              "pop(): the pile is empty, so there is nothing to take. This is a stack underflow.",
            status: "error",
            opIndex,
          });
          break;
        }
        frames.push({
          items,
          line: LINE.popCheck,
          caption: "pop(): first check. Is the pile empty? No, so we can continue.",
          status: "ok",
          opIndex,
        });
        frames.push({
          items,
          line: LINE.popRead,
          caption: `The top plate is ${top.value}. We take it.`,
          focusId: top.id,
          focusKind: "pop",
          status: "ok",
          opIndex,
        });
        items = items.slice(0, -1);
        frames.push({
          items,
          line: LINE.popReturn,
          caption: `Returned ${top.value}. ${describe(items)}`,
          output: top.value,
          status: "ok",
          opIndex,
        });
        break;
      }
      case "peek": {
        if (!top) {
          frames.push({
            items,
            line: LINE.peekCheck,
            caption: "peek(): the pile is empty, so there is no top plate to look at.",
            status: "error",
            opIndex,
          });
          break;
        }
        frames.push({
          items,
          line: LINE.peekReturn,
          caption: `peek(): the top plate is ${top.value}. We only look; the pile does not change.`,
          focusId: top.id,
          focusKind: "peek",
          output: top.value,
          status: "ok",
          opIndex,
        });
        break;
      }
      case "isEmpty": {
        frames.push({
          items,
          line: LINE.isEmptyReturn,
          caption: `is_empty(): the pile has ${items.length} plate${items.length === 1 ? "" : "s"}, so the answer is ${items.length === 0 ? "true" : "false"}.`,
          output: String(items.length === 0),
          status: "ok",
          opIndex,
        });
        break;
      }
    }
  });

  return frames;
}

/** Final contents, bottom to top. Handy for tests and hand-trace answers. */
export function finalStackValues(frames: readonly StackFrame[]) {
  return frames.at(-1)?.items.map((item) => item.value) ?? [];
}
