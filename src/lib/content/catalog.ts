/**
 * Display metadata for tracks and modules. Lessons reference these ids in their frontmatter.
 * Order here is the order shown in the UI.
 */
export type ModuleMeta = { id: string; title: string };
export type TrackMeta = { id: string; title: string; description: string; modules: ModuleMeta[] };

export const TRACKS: TrackMeta[] = [
  {
    id: "foundations",
    title: "Coding Foundations",
    description: "For absolute beginners: what code is, variables, loops and functions.",
    modules: [{ id: "basics", title: "First steps" }],
  },
  {
    id: "dsa-core",
    title: "DSA Core",
    description: "Every core data structure and algorithm, with a visualizer for each.",
    modules: [
      { id: "complexity", title: "Complexity" },
      { id: "arrays-strings", title: "Arrays and Strings" },
      { id: "hashing", title: "Hashing" },
      { id: "linked-lists", title: "Linked Lists" },
      { id: "stacks-queues", title: "Stacks and Queues" },
      { id: "recursion-backtracking", title: "Recursion and Backtracking" },
      { id: "searching-sorting", title: "Searching and Sorting" },
      { id: "trees", title: "Trees" },
      { id: "heaps", title: "Heaps" },
      { id: "graphs", title: "Graphs" },
      { id: "tries", title: "Tries" },
      { id: "dynamic-programming", title: "Dynamic Programming" },
      { id: "greedy-intervals", title: "Greedy and Intervals" },
      { id: "bits-math", title: "Bits and Math" },
    ],
  },
  {
    id: "patterns",
    title: "Interview Patterns",
    description: "The 15-pattern playbook with clue cards and drills.",
    modules: [{ id: "playbook", title: "Pattern playbook" }],
  },
  {
    id: "system-design",
    title: "System Design",
    description: "The restaurant track: building blocks, case studies and low-level design.",
    modules: [
      { id: "building-blocks", title: "Building blocks" },
      { id: "case-studies", title: "Case studies" },
      { id: "low-level-design", title: "Low-level design" },
    ],
  },
  {
    id: "competitive",
    title: "Competitive Programming",
    description: "Constraints, math, advanced structures and contest strategy.",
    modules: [{ id: "contest-toolkit", title: "Contest toolkit" }],
  },
  {
    id: "interview-skills",
    title: "Interview Skills",
    description: "Think aloud, tell STAR stories and test your code out loud.",
    modules: [{ id: "playbook", title: "Interview playbook" }],
  },
];

export function getTrackMeta(trackId: string): TrackMeta | undefined {
  return TRACKS.find((track) => track.id === trackId);
}

export function getModuleMeta(trackId: string, moduleId: string): ModuleMeta | undefined {
  return getTrackMeta(trackId)?.modules.find((module) => module.id === moduleId);
}

export function humanize(id: string) {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
