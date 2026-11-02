import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type QueueOp =
  { kind: "enqueue"; value: string } | { kind: "dequeue" } | { kind: "peek" } | { kind: "isEmpty" };

export type QueueItem = { id: string; value: string };

export type QueueFrame = BaseFrame & {
  items: QueueItem[];
  /** Item being acted on, used for highlighting. */
  focusId?: string;
  focusKind?: "enqueue" | "dequeue" | "peek";
  /** Value returned by the current operation, if any. */
  output?: string;
  /** Index of the operation this frame belongs to; -1 for the starting frame. */
  opIndex: number;
};

export const QUEUE_PSEUDOCODE: PseudocodeLine[] = [
  { text: "enqueue(x):", indent: 0 },
  { text: "items.append(x)        # join the back of the line", indent: 1 },
  { text: "dequeue():", indent: 0 },
  { text: "if is_empty(): error   # underflow", indent: 1 },
  { text: "x = items[front]", indent: 1 },
  { text: "remove front; return x", indent: 1 },
  { text: "peek():", indent: 0 },
  { text: "if is_empty(): error", indent: 1 },
  { text: "return items[front]    # look, don't take", indent: 1 },
  { text: "is_empty():", indent: 0 },
  { text: "return size == 0", indent: 1 },
];

export const LINE = {
  enqueue: 0,
  append: 1,
  dequeue: 2,
  dequeueCheck: 3,
  dequeueRead: 4,
  dequeueReturn: 5,
  peek: 6,
  peekCheck: 7,
  peekReturn: 8,
  isEmpty: 9,
  isEmptyReturn: 10,
} as const;

export const MAX_QUEUE_SIZE = 12;
const MAX_VALUE_LENGTH = 6;

/** Parses strings such as "enqueue 5", "dequeue", "peek" and "isEmpty" (case-insensitive). */
export function parseQueueOps(raw: string[]): ParseResult<QueueOp[]> {
  const ops: QueueOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim();
    if (!text) return;
    const [command = "", ...rest] = text.split(/\s+/);
    const argument = rest.join(" ");
    switch (command.toLowerCase()) {
      case "enqueue":
      case "enque":
      case "offer":
        if (!argument) errors.push(`Step ${index + 1}: "enqueue" needs a value, like "enqueue 5"`);
        else if (argument.length > MAX_VALUE_LENGTH)
          errors.push(`Step ${index + 1}: keep values to ${MAX_VALUE_LENGTH} characters`);
        else ops.push({ kind: "enqueue", value: argument });
        break;
      case "dequeue":
      case "deque":
      case "poll":
      case "peek":
        if (argument) errors.push(`Step ${index + 1}: "${command}" does not take a value`);
        else
          ops.push({
            kind: command.toLowerCase() === "peek" ? "peek" : "dequeue",
          });
        break;
      case "isempty":
      case "is_empty":
        ops.push({ kind: "isEmpty" });
        break;
      default:
        errors.push(
          `Step ${index + 1}: unknown operation "${command}". Use enqueue, dequeue, peek or isEmpty`,
        );
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

function describe(items: QueueItem[]) {
  if (items.length === 0) return "The line is empty.";
  const front = items[0]!;
  return `Front to back: ${items.map((item) => item.value).join(", ")}. ${front.value} is at the front.`;
}

/**
 * Turns a starting queue and a list of operations into animation frames.
 * Each operation becomes 1 to 3 frames so learners can follow every pseudocode line.
 */
export function buildQueueFrames(
  initial: readonly unknown[],
  ops: readonly QueueOp[],
): QueueFrame[] {
  let nextId = 0;
  const makeItem = (value: unknown): QueueItem => ({
    id: `person-${nextId++}`,
    value: String(value),
  });

  let items = initial.slice(0, MAX_QUEUE_SIZE).map(makeItem);
  const frames: QueueFrame[] = [
    {
      items,
      line: -1,
      caption: `Start. ${describe(items)}`,
      status: "idle",
      opIndex: -1,
    },
  ];

  ops.forEach((op, opIndex) => {
    const front = items[0];
    switch (op.kind) {
      case "enqueue": {
        if (items.length >= MAX_QUEUE_SIZE) {
          frames.push({
            items,
            line: LINE.enqueue,
            caption: `The line is full (${MAX_QUEUE_SIZE} people). We cannot enqueue ${op.value}. This is a queue overflow.`,
            status: "error",
            opIndex,
          });
          break;
        }
        frames.push({
          items,
          line: LINE.enqueue,
          caption: `enqueue(${op.value}): ${op.value} joins the back of the line.`,
          status: "ok",
          opIndex,
        });
        const item = makeItem(op.value);
        items = [...items, item];
        frames.push({
          items,
          line: LINE.append,
          caption: `${op.value} is now at the back. ${describe(items)}`,
          focusId: item.id,
          focusKind: "enqueue",
          status: "ok",
          opIndex,
        });
        break;
      }
      case "dequeue": {
        if (!front) {
          frames.push({
            items,
            line: LINE.dequeueCheck,
            caption:
              "dequeue(): the line is empty, so there is nobody to serve. This is a queue underflow.",
            status: "error",
            opIndex,
          });
          break;
        }
        frames.push({
          items,
          line: LINE.dequeueCheck,
          caption: "dequeue(): first check. Is the line empty? No, so we can continue.",
          status: "ok",
          opIndex,
        });
        frames.push({
          items,
          line: LINE.dequeueRead,
          caption: `The person at the front is ${front.value}. We serve them.`,
          focusId: front.id,
          focusKind: "dequeue",
          status: "ok",
          opIndex,
        });
        items = items.slice(1);
        frames.push({
          items,
          line: LINE.dequeueReturn,
          caption: `Returned ${front.value}. ${describe(items)}`,
          output: front.value,
          status: "ok",
          opIndex,
        });
        break;
      }
      case "peek": {
        if (!front) {
          frames.push({
            items,
            line: LINE.peekCheck,
            caption: "peek(): the line is empty, so there is no front person to look at.",
            status: "error",
            opIndex,
          });
          break;
        }
        frames.push({
          items,
          line: LINE.peekReturn,
          caption: `peek(): the front person is ${front.value}. We only look; the line does not change.`,
          focusId: front.id,
          focusKind: "peek",
          output: front.value,
          status: "ok",
          opIndex,
        });
        break;
      }
      case "isEmpty": {
        frames.push({
          items,
          line: LINE.isEmptyReturn,
          caption: `is_empty(): the line has ${items.length} person${items.length === 1 ? "" : "s"}, so the answer is ${items.length === 0 ? "true" : "false"}.`,
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

/** Final contents, front to back. Handy for tests and hand-trace answers. */
export function finalQueueValues(frames: readonly QueueFrame[]) {
  return frames.at(-1)?.items.map((item) => item.value) ?? [];
}
