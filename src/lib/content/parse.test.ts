import { describe, expect, it } from "vitest";
import {
  compareLessons,
  ContentError,
  extractReferences,
  extractToc,
  type LessonMeta,
  parseLessonSource,
  validateLessonSet,
} from "./parse";

const frontmatter = (overrides: Record<string, string> = {}) => {
  const fields: Record<string, string> = {
    slug: "stack-basics",
    track: "dsa-core",
    module: "stacks-queues",
    chapter: "'5.1'",
    title: "'Stack: The Pile of Plates'",
    level: "beginner",
    minutes: "12",
    status: "ready",
    prerequisites: "[arrays-basics]",
    analogy: "pile of plates",
    ...overrides,
  };
  return `---\n${Object.entries(fields)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n")}\n---\n\n## What you will learn\nBody`;
};

describe("parseLessonSource", () => {
  it("parses valid frontmatter and applies defaults", () => {
    const lesson = parseLessonSource(frontmatter(), "dsa-core/stacks-queues/stack-basics.mdx");
    expect(lesson.meta).toMatchObject({
      slug: "stack-basics",
      chapter: "5.1",
      xp: 40,
      patterns: [],
      tags: [],
      prerequisites: ["arrays-basics"],
    });
    expect(lesson.body).toContain("## What you will learn");
  });

  it("rejects invalid frontmatter with readable issues", () => {
    expect(() =>
      parseLessonSource(
        frontmatter({ level: "expert" }),
        "dsa-core/stacks-queues/stack-basics.mdx",
      ),
    ).toThrow(ContentError);
  });

  it("requires the folder layout to match the frontmatter", () => {
    expect(() => parseLessonSource(frontmatter(), "dsa-core/hashing/stack-basics.mdx")).toThrow(
      /module "stacks-queues" does not match folder "hashing"/,
    );
    expect(() => parseLessonSource(frontmatter(), "dsa-core/stacks-queues/stack.mdx")).toThrow(
      /does not match file/,
    );
  });

  it("rejects self prerequisites", () => {
    expect(() =>
      parseLessonSource(
        frontmatter({ prerequisites: "[stack-basics]" }),
        "dsa-core/stacks-queues/stack-basics.mdx",
      ),
    ).toThrow(/own prerequisite/);
  });
});

const meta = (overrides: Partial<LessonMeta>): LessonMeta => ({
  slug: "a",
  track: "dsa-core",
  module: "stacks-queues",
  chapter: "5.1",
  title: "Lesson",
  level: "beginner",
  minutes: 10,
  status: "ready",
  prerequisites: [],
  patterns: [],
  xp: 40,
  analogy: "x",
  tags: [],
  filePath: "x.mdx",
  ...overrides,
});

describe("compareLessons", () => {
  it("orders by track, then module, then chapter numerically", () => {
    const lessons = [
      meta({ slug: "c", chapter: "5.10" }),
      meta({ slug: "b", chapter: "5.2" }),
      meta({ slug: "d", module: "arrays-strings", chapter: "2.1" }),
      meta({ slug: "e", track: "foundations", module: "basics", chapter: "0.1" }),
    ];
    expect(lessons.sort(compareLessons).map((lesson) => lesson.slug)).toEqual(["e", "d", "b", "c"]);
  });
});

describe("validateLessonSet", () => {
  it("reports duplicate slugs and unknown prerequisites", () => {
    const issues = validateLessonSet([
      meta({ slug: "a", filePath: "one.mdx" }),
      meta({ slug: "a", filePath: "two.mdx" }),
      meta({ slug: "b", prerequisites: ["missing"], filePath: "three.mdx" }),
    ]);
    expect(issues).toHaveLength(2);
    expect(issues[0]).toMatch(/duplicate slug "a"/);
    expect(issues[1]).toMatch(/unknown prerequisite "missing"/);
  });
});

describe("extractToc", () => {
  it("collects h2 headings with github-style ids and skips code fences", () => {
    const body = "## The story\ntext\n```md\n## Not a heading\n```\n## How fast is it?\n### Sub";
    expect(extractToc(body)).toEqual([
      { id: "the-story", title: "The story" },
      { id: "how-fast-is-it", title: "How fast is it?" },
    ]);
  });
});

describe("extractReferences", () => {
  it("finds problem and quiz ids", () => {
    const body = `<Problems ids={['valid-parentheses', "min-stack"]} />\n<Quiz id='stack-quiz' />`;
    expect(extractReferences(body)).toEqual({
      problemIds: ["valid-parentheses", "min-stack"],
      quizIds: ["stack-quiz"],
    });
  });
});
