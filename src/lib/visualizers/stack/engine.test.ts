import { describe, expect, it } from "vitest";
import {
  buildStackFrames,
  finalStackValues,
  LINE,
  MAX_STACK_SIZE,
  parseStackOps,
  STACK_PSEUDOCODE,
  type StackOp,
} from "./engine";

const ops = (...raw: string[]): StackOp[] => {
  const result = parseStackOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseStackOps", () => {
  it("parses push, pop, peek and isEmpty case-insensitively", () => {
    expect(parseStackOps(["push 5", "POP", " peek ", "isEmpty", "is_empty", ""])).toEqual({
      ok: true,
      value: [
        { kind: "push", value: "5" },
        { kind: "pop" },
        { kind: "peek" },
        { kind: "isEmpty" },
        { kind: "isEmpty" },
      ],
    });
  });

  it("reports every invalid step with its position", () => {
    const result = parseStackOps(["push", "pop 3", "shift", "push 1234567"]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(4);
    expect(result.errors[0]).toMatch(/Step 1: "push" needs a value/);
    expect(result.errors[1]).toMatch(/Step 2: "pop" does not take a value/);
    expect(result.errors[2]).toMatch(/Step 3: unknown operation "shift"/);
    expect(result.errors[3]).toMatch(/Step 4: keep values to 6 characters/);
  });
});

describe("buildStackFrames", () => {
  it("starts with an idle frame describing the initial stack", () => {
    const [first] = buildStackFrames([3, 7], []);
    expect(first).toMatchObject({ line: -1, status: "idle", opIndex: -1 });
    expect(first?.caption).toContain("7 is on top");
    expect(first?.items.map((item) => item.value)).toEqual(["3", "7"]);
  });

  it("follows LIFO order: push 1, push 2, pop, push 3 leaves [1, 3]", () => {
    const frames = buildStackFrames([], ops("push 1", "push 2", "pop", "push 3"));
    expect(finalStackValues(frames)).toEqual(["1", "3"]);
  });

  it("splits push into two frames that end on the append line", () => {
    const frames = buildStackFrames([], ops("push 5"));
    expect(frames.slice(1).map((frame) => frame.line)).toEqual([LINE.push, LINE.append]);
    expect(frames.at(-1)).toMatchObject({ focusKind: "push", status: "ok" });
  });

  it("splits pop into check, read and return frames and reports the output", () => {
    const frames = buildStackFrames([3, 7], ops("pop"));
    const popFrames = frames.slice(1);
    expect(popFrames.map((frame) => frame.line)).toEqual([
      LINE.popCheck,
      LINE.popRead,
      LINE.popReturn,
    ]);
    expect(popFrames[1]).toMatchObject({ focusKind: "pop" });
    expect(popFrames[1]?.items).toHaveLength(2);
    expect(popFrames[2]).toMatchObject({ output: "7" });
    expect(popFrames[2]?.items.map((item) => item.value)).toEqual(["3"]);
  });

  it("peek returns the top without changing the stack", () => {
    const frames = buildStackFrames([3, 7], ops("peek"));
    const peek = frames.at(-1)!;
    expect(peek).toMatchObject({ output: "7", focusKind: "peek", line: LINE.peekReturn });
    expect(peek.items).toBe(frames[0]!.items);
  });

  it("produces an error frame on underflow instead of throwing", () => {
    const frames = buildStackFrames([], ops("pop", "peek"));
    expect(frames.slice(1).map((frame) => frame.status)).toEqual(["error", "error"]);
    expect(frames[1]?.caption).toMatch(/underflow/);
  });

  it("guards against overflow past the visual limit", () => {
    const full = Array.from({ length: MAX_STACK_SIZE }, (_, i) => i);
    const frames = buildStackFrames(full, ops("push 99"));
    expect(frames.at(-1)).toMatchObject({ status: "error" });
    expect(finalStackValues(frames)).toHaveLength(MAX_STACK_SIZE);
  });

  it("reports isEmpty truthfully", () => {
    expect(buildStackFrames([], ops("isEmpty")).at(-1)?.output).toBe("true");
    expect(buildStackFrames([1], ops("isEmpty")).at(-1)?.output).toBe("false");
  });

  it("gives every item a stable unique id across frames", () => {
    const frames = buildStackFrames([3], ops("push 3", "pop", "push 3"));
    const ids = frames.at(-1)!.items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(frames.at(-1)!.items[0]!.id).toBe(frames[0]!.items[0]!.id);
  });

  it("only references real pseudocode lines", () => {
    const frames = buildStackFrames([1], ops("push 2", "peek", "pop", "pop", "pop", "isEmpty"));
    for (const frame of frames) {
      expect(frame.line).toBeGreaterThanOrEqual(-1);
      expect(frame.line).toBeLessThan(STACK_PSEUDOCODE.length);
    }
  });
});
