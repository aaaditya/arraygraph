import { describe, expect, it } from "vitest";
import { buildLoopStepperFrames, LINE, parseLoopOps, type LoopOp } from "./engine";

const ops = (...raw: string[]): LoopOp[] => {
  const result = parseLoopOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseLoopOps", () => {
  it("parses sum, count and plates", () => {
    expect(parseLoopOps(["sum 5", "count 3", "plates 4"])).toEqual({
      ok: true,
      value: [
        { kind: "sum", n: 5 },
        { kind: "count", n: 3 },
        { kind: "plates", n: 4 },
      ],
    });
  });

  it("rejects n outside 1..12", () => {
    expect(parseLoopOps(["sum 0"]).ok).toBe(false);
    expect(parseLoopOps(["sum 13"]).ok).toBe(false);
  });
});

describe("buildLoopStepperFrames", () => {
  it("sums 1 to 4 ending at 10", () => {
    const frames = buildLoopStepperFrames([], ops("sum 4"));
    expect(frames.at(-1)).toMatchObject({
      total: 10,
      line: LINE.ret,
      status: "ok",
    });
  });

  it("washes every plate", () => {
    const frames = buildLoopStepperFrames([], ops("plates 3"));
    const last = frames.at(-1)!;
    expect(last.total).toBe(3);
    expect(last.items.every((item) => item.done)).toBe(true);
  });
});
