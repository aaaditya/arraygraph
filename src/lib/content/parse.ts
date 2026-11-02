import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import { TRACKS } from "./catalog";
import { formatZodIssues, type LessonFrontmatter, lessonFrontmatterSchema } from "./schemas";

export type LessonMeta = LessonFrontmatter & { filePath: string };
export type Lesson = { meta: LessonMeta; body: string };
export type TocItem = { id: string; title: string };

export class ContentError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly issues: string[],
  ) {
    super(`Invalid content in ${filePath}:\n${issues.map((issue) => `  - ${issue}`).join("\n")}`);
    this.name = "ContentError";
  }
}

/**
 * Parses and validates one lesson file. `relativePath` is relative to the content root and must be
 * `<track>/<module>/<slug>.mdx` so the folder layout always matches the frontmatter.
 */
export function parseLessonSource(source: string, relativePath: string): Lesson {
  const { data, content } = matter(source);
  const result = lessonFrontmatterSchema.safeParse(data);
  if (!result.success) throw new ContentError(relativePath, formatZodIssues(result.error));

  const meta = result.data;
  const segments = relativePath.replace(/\\/g, "/").split("/");
  const issues: string[] = [];
  if (segments.length !== 3) {
    issues.push("lesson files must live at <track>/<module>/<slug>.mdx");
  } else {
    const [track, module, file] = segments as [string, string, string];
    if (track !== meta.track) issues.push(`track "${meta.track}" does not match folder "${track}"`);
    if (module !== meta.module)
      issues.push(`module "${meta.module}" does not match folder "${module}"`);
    if (file !== `${meta.slug}.mdx`)
      issues.push(`slug "${meta.slug}" does not match file "${file}"`);
  }
  if (meta.prerequisites.includes(meta.slug))
    issues.push("a lesson cannot be its own prerequisite");
  if (issues.length) throw new ContentError(relativePath, issues);

  return { meta: { ...meta, filePath: relativePath }, body: content };
}

function trackIndex(trackId: string) {
  const index = TRACKS.findIndex((track) => track.id === trackId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function moduleIndex(trackId: string, moduleId: string) {
  const modules = TRACKS.find((track) => track.id === trackId)?.modules ?? [];
  const index = modules.findIndex((module) => module.id === moduleId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function compareLessons(a: LessonMeta, b: LessonMeta) {
  return (
    trackIndex(a.track) - trackIndex(b.track) ||
    moduleIndex(a.track, a.module) - moduleIndex(b.track, b.module) ||
    a.chapter.localeCompare(b.chapter, undefined, { numeric: true }) ||
    a.slug.localeCompare(b.slug)
  );
}

/** Cross-lesson checks: unique slugs and prerequisites that exist. */
export function validateLessonSet(lessons: LessonMeta[]): string[] {
  const issues: string[] = [];
  const slugs = new Map<string, string>();
  for (const lesson of lessons) {
    const existing = slugs.get(lesson.slug);
    if (existing)
      issues.push(`duplicate slug "${lesson.slug}" in ${existing} and ${lesson.filePath}`);
    slugs.set(lesson.slug, lesson.filePath);
  }
  for (const lesson of lessons) {
    for (const prerequisite of lesson.prerequisites) {
      if (!slugs.has(prerequisite)) {
        issues.push(`${lesson.filePath}: unknown prerequisite "${prerequisite}"`);
      }
    }
  }
  return issues;
}

/** Builds the table of contents from level-2 Markdown headings, matching rehype-slug ids. */
export function extractToc(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (match?.[1]) items.push({ id: slugger.slug(match[1]), title: match[1] });
  }
  return items;
}

/** Finds content references inside MDX so the content checker can verify they exist. */
export function extractReferences(body: string) {
  const problemIds = new Set<string>();
  const quizIds = new Set<string>();
  for (const match of body.matchAll(/<Problems\s+ids=\{\[([^\]]*)\]\}/g)) {
    for (const id of match[1]?.matchAll(/['"]([a-z0-9-]+)['"]/g) ?? []) {
      if (id[1]) problemIds.add(id[1]);
    }
  }
  for (const match of body.matchAll(/<Quiz\s+id=['"]([a-z0-9-]+)['"]/g)) {
    if (match[1]) quizIds.add(match[1]);
  }
  return { problemIds: [...problemIds], quizIds: [...quizIds] };
}
