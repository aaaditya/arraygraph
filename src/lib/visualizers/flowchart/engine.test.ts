import { describe, expect, it } from "vitest";
import {
  buildFlowchartFrames,
  LINE,
  parseFlowchartOps,
  type FlowchartOp,
} from "./engine";

const ops = (...raw: string[]): FlowchartOp[] => {
  const result = parseFlowchartOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseFlowchartOps", () => {
  it("parses colors with or without check", () => {
    expect(parseFlowchartOps(["check red", "yellow", "green"])).toEqual({
      ok: true,
      value: [
        { kind: "check", color: "red" },
        { kind: "check", color: "yellow" },
        { kind: "check", color: "green" },
      ],
    });
  });
});

describe("buildFlowchartFrames", () => {
  it("routes green to go", () => {
    const frames = buildFlowchartFrames([], ops("green"));
    expect(frames.some((frame) => frame.active === "go")).toBe(true);
    expect(frames.at(-1)).toMatchObject({
      active: "end",
      decision: "green → go",
      line: LINE.go,
    });
  });

  it("routes red to stop", () => {
    const frames = buildFlowchartFrames([], ops("red"));
    expect(frames.some((frame) => frame.active === "stop")).toBe(true);
  });
});
