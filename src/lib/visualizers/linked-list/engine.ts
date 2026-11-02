import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type LinkedListOp =
  | { kind: "append"; value: string }
  | { kind: "prepend"; value: string }
  | { kind: "delete"; value: string }
  | { kind: "reverse" };

export type ListNode = { id: string; value: string };

export type LinkedListFrame = BaseFrame & {
  nodes: ListNode[];
  focusId?: string;
  focusKind?: "append" | "prepend" | "delete" | "reverse";
  output?: string;
  opIndex: number;
};

export const LINKED_LIST_PSEUDOCODE: PseudocodeLine[] = [
  { text: "append(x):", indent: 0 },
  { text: "walk to tail; tail.next = new node(x)", indent: 1 },
  { text: "prepend(x):", indent: 0 },
  { text: "node = new node(x); node.next = head; head = node", indent: 1 },
  { text: "delete(x):", indent: 0 },
  { text: "find node with value x; unlink it", indent: 1 },
  { text: "reverse():", indent: 0 },
  { text: "prev = null; while curr: next = curr.next; curr.next = prev; …", indent: 1 },
];

export const LINE = {
  append: 0,
  appendBody: 1,
  prepend: 2,
  prependBody: 3,
  delete: 4,
  deleteBody: 5,
  reverse: 6,
  reverseBody: 7,
} as const;

export const MAX_LIST_SIZE = 12;
const MAX_VALUE_LENGTH = 6;

/** Parses append/prepend/delete/reverse operations. */
export function parseLinkedListOps(raw: string[]): ParseResult<LinkedListOp[]> {
  const ops: LinkedListOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim();
    if (!text) return;
    const [command = "", ...rest] = text.split(/\s+/);
    const argument = rest.join(" ");
    switch (command.toLowerCase()) {
      case "append":
      case "prepend":
      case "delete":
      case "remove": {
        const kind =
          command.toLowerCase() === "remove"
            ? "delete"
            : (command.toLowerCase() as "append" | "prepend" | "delete");
        if (!argument)
          errors.push(`Step ${index + 1}: "${command}" needs a value, like "${command} 5"`);
        else if (argument.length > MAX_VALUE_LENGTH)
          errors.push(`Step ${index + 1}: keep values to ${MAX_VALUE_LENGTH} characters`);
        else ops.push({ kind, value: argument });
        break;
      }
      case "reverse":
        if (argument) errors.push(`Step ${index + 1}: "reverse" does not take a value`);
        else ops.push({ kind: "reverse" });
        break;
      default:
        errors.push(
          `Step ${index + 1}: unknown operation "${command}". Use append, prepend, delete or reverse`,
        );
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

function describe(nodes: ListNode[]) {
  if (nodes.length === 0) return "The list is empty.";
  return `head → ${nodes.map((node) => node.value).join(" → ")} → null.`;
}

export function buildLinkedListFrames(
  initial: readonly unknown[],
  ops: readonly LinkedListOp[],
): LinkedListFrame[] {
  let nextId = 0;
  const makeNode = (value: unknown): ListNode => ({
    id: `node-${nextId++}`,
    value: String(value),
  });

  let nodes = initial.slice(0, MAX_LIST_SIZE).map(makeNode);
  const frames: LinkedListFrame[] = [
    {
      nodes,
      line: -1,
      caption: `Start. ${describe(nodes)}`,
      status: "idle",
      opIndex: -1,
    },
  ];

  ops.forEach((op, opIndex) => {
    switch (op.kind) {
      case "append": {
        if (nodes.length >= MAX_LIST_SIZE) {
          frames.push({
            nodes,
            line: LINE.append,
            caption: `append(${op.value}): the list is full (${MAX_LIST_SIZE} nodes).`,
            status: "error",
            opIndex,
          });
          break;
        }
        frames.push({
          nodes,
          line: LINE.append,
          caption: `append(${op.value}): walk to the tail and attach a new node.`,
          status: "ok",
          opIndex,
        });
        const node = makeNode(op.value);
        nodes = [...nodes, node];
        frames.push({
          nodes,
          line: LINE.appendBody,
          caption: `${op.value} is now the tail. ${describe(nodes)}`,
          focusId: node.id,
          focusKind: "append",
          status: "ok",
          opIndex,
        });
        break;
      }
      case "prepend": {
        if (nodes.length >= MAX_LIST_SIZE) {
          frames.push({
            nodes,
            line: LINE.prepend,
            caption: `prepend(${op.value}): the list is full (${MAX_LIST_SIZE} nodes).`,
            status: "error",
            opIndex,
          });
          break;
        }
        frames.push({
          nodes,
          line: LINE.prepend,
          caption: `prepend(${op.value}): new node becomes the head.`,
          status: "ok",
          opIndex,
        });
        const node = makeNode(op.value);
        nodes = [node, ...nodes];
        frames.push({
          nodes,
          line: LINE.prependBody,
          caption: `${op.value} is now the head. ${describe(nodes)}`,
          focusId: node.id,
          focusKind: "prepend",
          status: "ok",
          opIndex,
        });
        break;
      }
      case "delete": {
        const index = nodes.findIndex((node) => node.value === op.value);
        if (index < 0) {
          frames.push({
            nodes,
            line: LINE.deleteBody,
            caption: `delete(${op.value}): no node with value ${op.value} was found.`,
            status: "error",
            opIndex,
          });
          break;
        }
        const target = nodes[index]!;
        frames.push({
          nodes,
          line: LINE.delete,
          caption: `delete(${op.value}): find the first node with value ${op.value}.`,
          focusId: target.id,
          focusKind: "delete",
          status: "ok",
          opIndex,
        });
        nodes = [...nodes.slice(0, index), ...nodes.slice(index + 1)];
        frames.push({
          nodes,
          line: LINE.deleteBody,
          caption: `Unlinked ${op.value}. ${describe(nodes)}`,
          output: op.value,
          status: "ok",
          opIndex,
        });
        break;
      }
      case "reverse": {
        frames.push({
          nodes,
          line: LINE.reverse,
          caption: "reverse(): flip every next pointer so the list runs the other way.",
          status: "ok",
          opIndex,
        });
        nodes = [...nodes].reverse();
        frames.push({
          nodes,
          line: LINE.reverseBody,
          caption: `Reversed. ${describe(nodes)}`,
          focusKind: "reverse",
          focusId: nodes[0]?.id,
          status: "ok",
          opIndex,
        });
        break;
      }
    }
  });

  return frames;
}

export function finalLinkedListValues(frames: readonly LinkedListFrame[]) {
  return frames.at(-1)?.nodes.map((node) => node.value) ?? [];
}
