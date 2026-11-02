import { describe, expect, it } from "vitest";
import {
  buildStepRunnerFrames,
  LINE,
  parseStepRunnerOps,
  type StepRunnerOp,
} from "./engine";

const ops = (...raw: string[]): StepRunnerOp[] => {
  const result = parseStepRunnerOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseStepRunnerOps", () => {
  it("defaults empty ops to a single run", () => {
    expect(parseStepRunnerOps([])).toEqual({ ok: true, value: [{ kind: "run" }] });
  });

  it("parses run and reset", () => {
    expect(parseStepRunnerOps(["run", "RESET", "play"])).toEqual({
      ok: true,
      value: [{ kind: "run" }, { kind: "reset" }, { kind: "run" }],
    });
  });

  it("rejects unknown ops", () => {
    const result = parseStepRunnerOps(["jump"]);
    expect(result.ok).toBe(false);
  });
});

describe("buildStepRunnerFrames", () => {
  it("walks each chai step and ends done", () => {
    const frames = buildStepRunnerFrames(
      ["Boil water", "Add tea", "Pour"],
      ops("run"),
    );
    expect(frames[0]).toMatchObject({ current: -1, done: false, status: "idle" });
    const active = frames.filter((frame) => frame.line === LINE.doStep);
    expect(active.map((frame) => frame.current)).toEqual([0, 1, 2]);
    expect(frames.at(-1)).toMatchObject({ done: true, line: LINE.stop, status: "ok" });
  });
});
