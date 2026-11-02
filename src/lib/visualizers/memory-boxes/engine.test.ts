import { describe, expect, it } from "vitest";
import {
  buildMemoryBoxesFrames,
  parseMemoryOps,
  type MemoryOp,
} from "./engine";

const ops = (...raw: string[]): MemoryOp[] => {
  const result = parseMemoryOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseMemoryOps", () => {
  it("parses set, swap and read", () => {
    expect(parseMemoryOps(["set a 5", "swap a b", "read a"])).toEqual({
      ok: true,
      value: [
        { kind: "set", name: "a", value: "5" },
        { kind: "swap", left: "a", right: "b" },
        { kind: "read", name: "a" },
      ],
    });
  });

  it("rejects incomplete set", () => {
    const result = parseMemoryOps(["set a"]);
    expect(result.ok).toBe(false);
  });
});

describe("buildMemoryBoxesFrames", () => {
  it("swaps two labeled boxes using a temp helper", () => {
    const frames = buildMemoryBoxesFrames(["a=3", "b=7"], ops("swap a b"));
    const last = frames.at(-1)!;
    expect(last.boxes.find((box) => box.name === "a")?.value).toBe("7");
    expect(last.boxes.find((box) => box.name === "b")?.value).toBe("3");
    expect(frames.some((frame) => frame.highlightTemp)).toBe(true);
  });

  it("sets a new box and reads it back", () => {
    const frames = buildMemoryBoxesFrames([], ops("set name Riya", "read name"));
    expect(frames.at(-1)).toMatchObject({ output: "Riya", status: "ok" });
  });
});
