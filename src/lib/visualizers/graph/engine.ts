import type { BaseFrame, ParseResult, PseudocodeLine } from "../types";

export type GraphOp = { kind: "bfs" | "dfs"; start: string };

export type GraphEdge = { from: string; to: string };

export type GraphFrame = BaseFrame & {
  nodes: string[];
  edges: GraphEdge[];
  visited: string[];
  frontier: string[];
  /** "queue" for BFS, "stack" for DFS. */
  frontierKind: "queue" | "stack" | null;
  current?: string;
  output?: string;
  opIndex: number;
};

export const GRAPH_PSEUDOCODE: PseudocodeLine[] = [
  { text: "bfs(start) / dfs(start):", indent: 0 },
  { text: "frontier = [start]; visited = {start}", indent: 1 },
  { text: "while frontier is not empty:", indent: 1 },
  { text: "current = take from frontier   # queue front / stack top", indent: 2 },
  { text: "visit current", indent: 2 },
  { text: "for each neighbor of current:", indent: 2 },
  { text: "if not visited: mark + push onto frontier", indent: 3 },
  { text: "done", indent: 1 },
];

export const LINE = {
  header: 0,
  init: 1,
  whileCheck: 2,
  take: 3,
  visit: 4,
  neighbors: 5,
  enqueue: 6,
  done: 7,
} as const;

/** Parses edge strings like "A-B" or "A—B" into undirected edges. */
export function parseGraphEdges(raw: readonly unknown[]): ParseResult<GraphEdge[]> {
  const edges: GraphEdge[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  raw.forEach((entry, index) => {
    const text = String(entry).trim();
    if (!text) return;
    const match = text.match(/^([A-Za-z0-9]+)\s*[-–—]\s*([A-Za-z0-9]+)$/);
    if (!match) {
      errors.push(`Edge ${index + 1}: expected "A-B", got "${text}"`);
      return;
    }
    const from = match[1]!;
    const to = match[2]!;
    if (from === to) {
      errors.push(`Edge ${index + 1}: self-loops are not supported ("${text}")`);
      return;
    }
    const key = [from, to].sort().join("-");
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ from, to });
  });

  return errors.length ? { ok: false, errors } : { ok: true, value: edges };
}

/** Parses strings such as "bfs A" or "dfs Start" (case-insensitive command). */
export function parseGraphOps(raw: string[]): ParseResult<GraphOp[]> {
  const ops: GraphOp[] = [];
  const errors: string[] = [];
  raw.forEach((entry, index) => {
    const text = entry.trim();
    if (!text) return;
    const [command = "", ...rest] = text.split(/\s+/);
    const argument = rest.join(" ");
    switch (command.toLowerCase()) {
      case "bfs":
      case "dfs":
        if (!argument)
          errors.push(`Step ${index + 1}: "${command}" needs a start node, like "${command} A"`);
        else ops.push({ kind: command.toLowerCase() as "bfs" | "dfs", start: argument });
        break;
      default:
        errors.push(`Step ${index + 1}: unknown operation "${command}". Use "bfs A" or "dfs A"`);
    }
  });
  return errors.length ? { ok: false, errors } : { ok: true, value: ops };
}

function collectNodes(edges: readonly GraphEdge[], extra: string[] = []): string[] {
  const set = new Set<string>(extra);
  for (const edge of edges) {
    set.add(edge.from);
    set.add(edge.to);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function buildAdjacency(edges: readonly GraphEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  const add = (from: string, to: string) => {
    const list = adj.get(from) ?? [];
    list.push(to);
    adj.set(from, list);
  };
  for (const edge of edges) {
    add(edge.from, edge.to);
    add(edge.to, edge.from);
  }
  for (const [node, neighbors] of adj) {
    adj.set(
      node,
      [...neighbors].sort((a, b) => a.localeCompare(b)),
    );
  }
  return adj;
}

/**
 * Turns undirected edges and BFS/DFS operations into animation frames
 * showing visited set, frontier (queue/stack), and current node.
 */
export function buildGraphFrames(
  initial: readonly unknown[],
  ops: readonly GraphOp[],
): GraphFrame[] {
  const parsedEdges = parseGraphEdges(initial);
  const edges = parsedEdges.ok ? parsedEdges.value : [];
  const startNodes = ops.map((op) => op.start);
  const nodes = collectNodes(edges, startNodes);
  const adj = buildAdjacency(edges);

  const frames: GraphFrame[] = [
    {
      nodes,
      edges,
      visited: [],
      frontier: [],
      frontierKind: null,
      line: -1,
      caption:
        nodes.length === 0
          ? "Start. No nodes yet."
          : `Start. Undirected graph with nodes ${nodes.join(", ")}.`,
      status: parsedEdges.ok ? "idle" : "error",
      opIndex: -1,
    },
  ];

  if (!parsedEdges.ok) {
    frames[0] = {
      ...frames[0]!,
      caption: `Could not parse edges: ${parsedEdges.errors.join("; ")}`,
      status: "error",
    };
    return frames;
  }

  ops.forEach((op, opIndex) => {
    const frontierKind = op.kind === "bfs" ? "queue" : "stack";
    const visited = new Set<string>();
    const frontier: string[] = [op.start];
    visited.add(op.start);

    frames.push({
      nodes,
      edges,
      visited: [...visited],
      frontier: [...frontier],
      frontierKind,
      current: undefined,
      line: LINE.init,
      caption: `${op.kind.toUpperCase()} from ${op.start}: frontier ${frontierKind} = [${op.start}], visited = {${op.start}}.`,
      status: "ok",
      opIndex,
    });

    const order: string[] = [];

    while (frontier.length > 0) {
      frames.push({
        nodes,
        edges,
        visited: [...visited],
        frontier: [...frontier],
        frontierKind,
        line: LINE.whileCheck,
        caption: `Frontier ${frontierKind} is not empty: [${frontier.join(", ")}].`,
        status: "ok",
        opIndex,
      });

      const current = op.kind === "bfs" ? frontier.shift()! : frontier.pop()!;
      order.push(current);

      frames.push({
        nodes,
        edges,
        visited: [...visited],
        frontier: [...frontier],
        frontierKind,
        current,
        line: LINE.take,
        caption: `Take ${current} from the ${frontierKind}.`,
        status: "ok",
        opIndex,
      });

      frames.push({
        nodes,
        edges,
        visited: [...visited],
        frontier: [...frontier],
        frontierKind,
        current,
        line: LINE.visit,
        caption: `Visit ${current}. Order so far: ${order.join(" → ")}.`,
        status: "ok",
        opIndex,
      });

      const neighbors = adj.get(current) ?? [];
      frames.push({
        nodes,
        edges,
        visited: [...visited],
        frontier: [...frontier],
        frontierKind,
        current,
        line: LINE.neighbors,
        caption:
          neighbors.length === 0
            ? `${current} has no neighbors.`
            : `Neighbors of ${current}: ${neighbors.join(", ")}.`,
        status: "ok",
        opIndex,
      });

      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        frontier.push(neighbor);
        frames.push({
          nodes,
          edges,
          visited: [...visited],
          frontier: [...frontier],
          frontierKind,
          current,
          line: LINE.enqueue,
          caption: `${neighbor} is new — mark visited and push onto the ${frontierKind}.`,
          status: "ok",
          opIndex,
        });
      }
    }

    frames.push({
      nodes,
      edges,
      visited: [...visited],
      frontier: [],
      frontierKind,
      line: LINE.done,
      caption: `${op.kind.toUpperCase()} complete. Visit order: ${order.join(" → ") || "(none)"}.`,
      output: order.join(" → "),
      status: "ok",
      opIndex,
    });
  });

  return frames;
}
