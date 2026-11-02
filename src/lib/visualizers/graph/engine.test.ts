import { describe, expect, it } from "vitest";
import {
  buildGraphFrames,
  GRAPH_PSEUDOCODE,
  LINE,
  parseGraphEdges,
  parseGraphOps,
  type GraphOp,
} from "./engine";

const ops = (...raw: string[]): GraphOp[] => {
  const result = parseGraphOps(raw);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.value;
};

describe("parseGraphEdges", () => {
  it("parses undirected edges and dedupes", () => {
    expect(parseGraphEdges(["A-B", "B-C", "B-A", ""])).toEqual({
      ok: true,
      value: [
        { from: "A", to: "B" },
        { from: "B", to: "C" },
      ],
    });
  });

  it("rejects malformed edges", () => {
    const result = parseGraphEdges(["A", "A-A"]);
    expect(result.ok).toBe(false);
  });
});

describe("parseGraphOps", () => {
  it("parses bfs and dfs", () => {
    expect(parseGraphOps(["bfs A", "DFS B"])).toEqual({
      ok: true,
      value: [
        { kind: "bfs", start: "A" },
        { kind: "dfs", start: "B" },
      ],
    });
  });
});

describe("buildGraphFrames", () => {
  const edges = ["A-B", "B-C", "A-D"];

  it("runs BFS in level order", () => {
    const frames = buildGraphFrames(edges, ops("bfs A"));
    const last = frames.at(-1)!;
    expect(last.output).toBe("A → B → D → C");
    expect(last.line).toBe(LINE.done);
    expect(last.frontierKind).toBe("queue");
  });

  it("runs DFS using a stack (neighbors ascending, so later letters first)", () => {
    const frames = buildGraphFrames(edges, ops("dfs A"));
    const last = frames.at(-1)!;
    expect(last.frontierKind).toBe("stack");
    expect(last.output?.startsWith("A")).toBe(true);
    expect(last.visited.sort()).toEqual(["A", "B", "C", "D"]);
  });

  it("tracks visited and frontier on intermediate frames", () => {
    const frames = buildGraphFrames(edges, ops("bfs A"));
    const visitFrames = frames.filter((frame) => frame.line === LINE.visit);
    expect(visitFrames[0]?.current).toBe("A");
    expect(visitFrames.some((frame) => frame.visited.includes("A"))).toBe(true);
  });

  it("only references real pseudocode lines", () => {
    const frames = buildGraphFrames(edges, ops("bfs A", "dfs A"));
    for (const frame of frames) {
      expect(frame.line).toBeGreaterThanOrEqual(-1);
      expect(frame.line).toBeLessThan(GRAPH_PSEUDOCODE.length);
    }
  });
});
