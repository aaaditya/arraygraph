import { describe, expect, it } from "vitest";
import {
  buildQueueFrames,
  finalQueueValues,
  LINE,
  MAX_QUEUE_SIZE,
  parseQueueOps,
  QUEUE_PSEUDOCODE,
  type QueueOp,
} from "./engine";

const ops = (...raw: string[]): QueueOp[] => {
  const result = parseQueueOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseQueueOps", () => {
  it("parses enqueue, dequeue, peek and isEmpty case-insensitively", () => {
    expect(parseQueueOps(["enqueue 5", "DEQUEUE", " peek ", "isEmpty", "is_empty", ""])).toEqual({
      ok: true,
      value: [
        { kind: "enqueue", value: "5" },
        { kind: "dequeue" },
        { kind: "peek" },
        { kind: "isEmpty" },
        { kind: "isEmpty" },
      ],
    });
  });

  it("reports every invalid step with its position", () => {
    const result = parseQueueOps(["enqueue", "dequeue 3", "push", "enqueue 1234567"]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(4);
    expect(result.errors[0]).toMatch(/Step 1: "enqueue" needs a value/);
    expect(result.errors[1]).toMatch(/Step 2: "dequeue" does not take a value/);
    expect(result.errors[2]).toMatch(/Step 3: unknown operation "push"/);
    expect(result.errors[3]).toMatch(/Step 4: keep values to 6 characters/);
  });
});

describe("buildQueueFrames", () => {
  it("starts with an idle frame describing the initial queue", () => {
    const [first] = buildQueueFrames([3, 7], []);
    expect(first).toMatchObject({ line: -1, status: "idle", opIndex: -1 });
    expect(first?.caption).toContain("3 is at the front");
    expect(first?.items.map((item) => item.value)).toEqual(["3", "7"]);
  });

  it("follows FIFO order: enqueue 1, enqueue 2, dequeue, enqueue 3 leaves [2, 3]", () => {
    const frames = buildQueueFrames([], ops("enqueue 1", "enqueue 2", "dequeue", "enqueue 3"));
    expect(finalQueueValues(frames)).toEqual(["2", "3"]);
  });

  it("splits enqueue into two frames that end on the append line", () => {
    const frames = buildQueueFrames([], ops("enqueue 5"));
    expect(frames.slice(1).map((frame) => frame.line)).toEqual([LINE.enqueue, LINE.append]);
    expect(frames.at(-1)).toMatchObject({ focusKind: "enqueue", status: "ok" });
  });

  it("splits dequeue into check, read and return frames and reports the output", () => {
    const frames = buildQueueFrames([3, 7], ops("dequeue"));
    const dequeueFrames = frames.slice(1);
    expect(dequeueFrames.map((frame) => frame.line)).toEqual([
      LINE.dequeueCheck,
      LINE.dequeueRead,
      LINE.dequeueReturn,
    ]);
    expect(dequeueFrames[1]).toMatchObject({ focusKind: "dequeue" });
    expect(dequeueFrames[1]?.items).toHaveLength(2);
    expect(dequeueFrames[2]).toMatchObject({ output: "3" });
    expect(dequeueFrames[2]?.items.map((item) => item.value)).toEqual(["7"]);
  });

  it("peek returns the front without changing the queue", () => {
    const frames = buildQueueFrames([3, 7], ops("peek"));
    const peek = frames.at(-1)!;
    expect(peek).toMatchObject({ output: "3", focusKind: "peek", line: LINE.peekReturn });
    expect(peek.items).toBe(frames[0]!.items);
  });

  it("produces an error frame on underflow instead of throwing", () => {
    const frames = buildQueueFrames([], ops("dequeue", "peek"));
    expect(frames.slice(1).map((frame) => frame.status)).toEqual(["error", "error"]);
    expect(frames[1]?.caption).toMatch(/underflow/);
  });

  it("guards against overflow past the visual limit", () => {
    const full = Array.from({ length: MAX_QUEUE_SIZE }, (_, i) => i);
    const frames = buildQueueFrames(full, ops("enqueue 99"));
    expect(frames.at(-1)).toMatchObject({ status: "error" });
    expect(finalQueueValues(frames)).toHaveLength(MAX_QUEUE_SIZE);
  });

  it("reports isEmpty truthfully", () => {
    expect(buildQueueFrames([], ops("isEmpty")).at(-1)?.output).toBe("true");
    expect(buildQueueFrames([1], ops("isEmpty")).at(-1)?.output).toBe("false");
  });

  it("only references real pseudocode lines", () => {
    const frames = buildQueueFrames(
      [1],
      ops("enqueue 2", "peek", "dequeue", "dequeue", "dequeue", "isEmpty"),
    );
    for (const frame of frames) {
      expect(frame.line).toBeGreaterThanOrEqual(-1);
      expect(frame.line).toBeLessThan(QUEUE_PSEUDOCODE.length);
    }
  });
});
