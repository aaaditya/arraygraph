import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type MemoryOp =
  | { kind: "set"; name: string; value: string }
  | { kind: "swap"; left: string; right: string }
  | { kind: "read"; name: string };

export type MemoryBox = { name: string; value: string; type: string };

export type MemoryBoxesFrame = BaseFrame & {
  boxes: MemoryBox[];
  focus?: string[];
  highlightTemp?: boolean;
  tempValue?: string;
  output?: string;
  opIndex: number;
};

export const MEMORY_BOXES_PSEUDOCODE: PseudocodeLine[] = [
  { text: "set name = value:", indent: 0 },
  { text: "put value into the box named name", indent: 1 },
  { text: "swap a and b:", indent: 0 },
  { text: "temp = a", indent: 1 },
  { text: "a = b", indent: 1 },
  { text: "b = temp", indent: 1 },
  { text: "read name:", indent: 0 },
  { text: "look inside the box named name", indent: 1 },
];

export const LINE = {
  set: 0,
  setPut: 1,
  swap: 2,
  swapTemp: 3,
  swapA: 4,
  swapB: 5,
  read: 6,
  readLook: 7,
} as const;

const MAX_BOXES = 8;
const MAX_NAME = 12;
const MAX_VALUE = 16;

function guessType(value: string): string {
  if (value === "true" || value === "false") return "boolean";
  if (value !== "" && !Number.isNaN(Number(value))) return "number";
  return "string";
}

export function parseMemoryInitial(initial: unknown[]): MemoryBox[] {
  const boxes: MemoryBox[] = [];
  for (const entry of initial) {
    const text = String(entry).trim();
    if (!text) continue;
    const eq = text.indexOf("=");
    if (eq <= 0) continue;
    const name = text.slice(0, eq).trim();
    const value = text.slice(eq + 1).trim();
    if (!name || boxes.length >= MAX_BOXES) continue;
    boxes.push({ name, value, type: guessType(value) });
  }
  return boxes;
}

/** Parses "set a 5", "swap a b", "read a". */
export function parseMemoryOps(raw: string[]): ParseResult<MemoryOp[]> {
  const ops: MemoryOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim();
    if (!text) return;
    const [command = "", ...rest] = text.split(/\s+/);
    switch (command.toLowerCase()) {
      case "set":
      case "assign": {
        const [name = "", ...valueParts] = rest;
        const value = valueParts.join(" ");
        if (!name || !value)
          errors.push(`Step ${index + 1}: use "set name value", like "set age 12".`);
        else if (name.length > MAX_NAME)
          errors.push(`Step ${index + 1}: keep names under ${MAX_NAME} characters.`);
        else if (value.length > MAX_VALUE)
          errors.push(`Step ${index + 1}: keep values under ${MAX_VALUE} characters.`);
        else ops.push({ kind: "set", name, value });
        break;
      }
      case "swap": {
        const [left = "", right = "", extra] = rest;
        if (!left || !right || extra) errors.push(`Step ${index + 1}: use "swap a b".`);
        else ops.push({ kind: "swap", left, right });
        break;
      }
      case "read":
      case "get": {
        const [name = "", extra] = rest;
        if (!name || extra) errors.push(`Step ${index + 1}: use "read name".`);
        else ops.push({ kind: "read", name });
        break;
      }
      default:
        errors.push(`Step ${index + 1}: unknown operation "${command}". Use set, swap or read.`);
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

function cloneBoxes(boxes: MemoryBox[]): MemoryBox[] {
  return boxes.map((box) => ({ ...box }));
}

function findBox(boxes: MemoryBox[], name: string): MemoryBox | undefined {
  return boxes.find((box) => box.name === name);
}

function upsert(boxes: MemoryBox[], name: string, value: string): MemoryBox[] {
  const next = cloneBoxes(boxes);
  const existing = findBox(next, name);
  if (existing) {
    existing.value = value;
    existing.type = guessType(value);
    return next;
  }
  if (next.length >= MAX_BOXES) return next;
  next.push({ name, value, type: guessType(value) });
  return next;
}

function describe(boxes: MemoryBox[]): string {
  if (boxes.length === 0) return "Memory is empty.";
  return boxes.map((box) => `${box.name}=${box.value}`).join(", ");
}

export function buildMemoryBoxesFrames(initial: unknown[], ops: MemoryOp[]): MemoryBoxesFrame[] {
  let boxes = parseMemoryInitial(initial);
  const frames: MemoryBoxesFrame[] = [
    {
      line: -1,
      caption: `Starting memory: ${describe(boxes)}`,
      status: "idle",
      boxes: cloneBoxes(boxes),
      opIndex: -1,
    },
  ];

  ops.forEach((op, opIndex) => {
    if (op.kind === "set") {
      frames.push({
        line: LINE.set,
        caption: `Set ${op.name} to ${op.value}.`,
        status: "ok",
        boxes: cloneBoxes(boxes),
        focus: [op.name],
        opIndex,
      });
      boxes = upsert(boxes, op.name, op.value);
      frames.push({
        line: LINE.setPut,
        caption: `Box "${op.name}" now holds ${op.value}.`,
        status: "ok",
        boxes: cloneBoxes(boxes),
        focus: [op.name],
        opIndex,
      });
      return;
    }

    if (op.kind === "read") {
      const box = findBox(boxes, op.name);
      if (!box) {
        frames.push({
          line: LINE.read,
          caption: `No box named "${op.name}".`,
          status: "error",
          boxes: cloneBoxes(boxes),
          focus: [op.name],
          opIndex,
        });
        return;
      }
      frames.push({
        line: LINE.readLook,
        caption: `Looking in "${op.name}"… it holds ${box.value}.`,
        status: "ok",
        boxes: cloneBoxes(boxes),
        focus: [op.name],
        output: box.value,
        opIndex,
      });
      return;
    }

    // swap
    const left = findBox(boxes, op.left);
    const right = findBox(boxes, op.right);
    if (!left || !right) {
      frames.push({
        line: LINE.swap,
        caption: `Need both "${op.left}" and "${op.right}" to swap.`,
        status: "error",
        boxes: cloneBoxes(boxes),
        focus: [op.left, op.right],
        opIndex,
      });
      return;
    }

    const leftValue = left.value;
    const rightValue = right.value;

    frames.push({
      line: LINE.swap,
      caption: `Swap ${op.left} and ${op.right}.`,
      status: "ok",
      boxes: cloneBoxes(boxes),
      focus: [op.left, op.right],
      opIndex,
    });
    frames.push({
      line: LINE.swapTemp,
      caption: `Save ${op.left} (${leftValue}) in a temp box.`,
      status: "ok",
      boxes: cloneBoxes(boxes),
      focus: [op.left],
      highlightTemp: true,
      tempValue: leftValue,
      opIndex,
    });
    boxes = upsert(boxes, op.left, rightValue);
    frames.push({
      line: LINE.swapA,
      caption: `Copy ${op.right} (${rightValue}) into ${op.left}.`,
      status: "ok",
      boxes: cloneBoxes(boxes),
      focus: [op.left, op.right],
      highlightTemp: true,
      tempValue: leftValue,
      opIndex,
    });
    boxes = upsert(boxes, op.right, leftValue);
    frames.push({
      line: LINE.swapB,
      caption: `Put temp (${leftValue}) into ${op.right}. Swap done.`,
      status: "ok",
      boxes: cloneBoxes(boxes),
      focus: [op.left, op.right],
      opIndex,
    });
  });

  return frames;
}
