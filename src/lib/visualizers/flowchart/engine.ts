import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type FlowchartOp = { kind: "check"; color: "red" | "yellow" | "green" };

export type FlowNodeId = "start" | "ask" | "red" | "yellow" | "green" | "stop" | "wait" | "go" | "end";

export type FlowchartFrame = BaseFrame & {
  active: FlowNodeId;
  color?: FlowchartOp["color"];
  decision?: string;
  opIndex: number;
};

export const FLOWCHART_PSEUDOCODE: PseudocodeLine[] = [
  { text: "look at the traffic light", indent: 0 },
  { text: "if color is red:", indent: 0 },
  { text: "stop", indent: 1 },
  { text: "else if color is yellow:", indent: 0 },
  { text: "wait", indent: 1 },
  { text: "else if color is green:", indent: 0 },
  { text: "go", indent: 1 },
];

export const LINE = {
  look: 0,
  ifRed: 1,
  stop: 2,
  ifYellow: 3,
  wait: 4,
  ifGreen: 5,
  go: 6,
} as const;

/** Parses "check red", "red", "yellow", "green". */
export function parseFlowchartOps(raw: string[]): ParseResult<FlowchartOp[]> {
  const ops: FlowchartOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim().toLowerCase();
    if (!text) return;
    const parts = text.split(/\s+/);
    const colorToken = parts[0] === "check" || parts[0] === "signal" ? parts[1] : parts[0];
    if (colorToken === "red" || colorToken === "yellow" || colorToken === "green") {
      ops.push({ kind: "check", color: colorToken });
    } else {
      errors.push(
        `Step ${index + 1}: unknown color "${entry}". Use red, yellow or green.`,
      );
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

export function buildFlowchartFrames(
  _initial: unknown[],
  ops: FlowchartOp[],
): FlowchartFrame[] {
  const frames: FlowchartFrame[] = [
    {
      line: -1,
      caption: "You are at a crossing. Watch the traffic light.",
      status: "idle",
      active: "start",
      opIndex: -1,
    },
  ];

  const path: Record<
    FlowchartOp["color"],
    { askLine: number; actionLine: number; node: FlowNodeId; action: FlowNodeId; decision: string; caption: string }
  > = {
    red: {
      askLine: LINE.ifRed,
      actionLine: LINE.stop,
      node: "red",
      action: "stop",
      decision: "red → stop",
      caption: "Red light. Stop and wait.",
    },
    yellow: {
      askLine: LINE.ifYellow,
      actionLine: LINE.wait,
      node: "yellow",
      action: "wait",
      decision: "yellow → wait",
      caption: "Yellow light. Wait — it will change soon.",
    },
    green: {
      askLine: LINE.ifGreen,
      actionLine: LINE.go,
      node: "green",
      action: "go",
      decision: "green → go",
      caption: "Green light. You can go.",
    },
  };

  ops.forEach((op, opIndex) => {
    frames.push({
      line: LINE.look,
      caption: `The light is ${op.color}. Let's decide.`,
      status: "ok",
      active: "ask",
      color: op.color,
      opIndex,
    });

    const branch = path[op.color];
    frames.push({
      line: branch.askLine,
      caption: `Is it ${op.color}? Yes.`,
      status: "ok",
      active: branch.node,
      color: op.color,
      decision: branch.decision,
      opIndex,
    });
    frames.push({
      line: branch.actionLine,
      caption: branch.caption,
      status: "ok",
      active: branch.action,
      color: op.color,
      decision: branch.decision,
      opIndex,
    });
    frames.push({
      line: branch.actionLine,
      caption: "Decision done. Ready for the next light.",
      status: "ok",
      active: "end",
      color: op.color,
      decision: branch.decision,
      opIndex,
    });
  });

  return frames;
}
