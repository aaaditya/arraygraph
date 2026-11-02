import { promises as fs } from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { getModuleMeta, getTrackMeta, humanize } from "./catalog";
import {
  compareLessons,
  ContentError,
  type Lesson,
  type LessonMeta,
  parseLessonSource,
  validateLessonSet,
} from "./parse";
import { formatZodIssues, type Problem, problemSchema, type Quiz, quizSchema } from "./schemas";

export const CONTENT_DIR = path.join(process.cwd(), "content");
const DATA_DIRS = new Set(["problems", "quizzes"]);

async function walkMdx(dir: string, base = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (dir === base && DATA_DIRS.has(entry.name)) return [];
        return walkMdx(full, base);
      }
      return entry.name.endsWith(".mdx") ? [path.relative(base, full)] : [];
    }),
  );
  return files.flat();
}

let lessonsPromise: Promise<Lesson[]> | undefined;

async function readAllLessons(): Promise<Lesson[]> {
  const files = await walkMdx(CONTENT_DIR);
  const lessons = await Promise.all(
    files.map(async (file) =>
      parseLessonSource(await fs.readFile(path.join(CONTENT_DIR, file), "utf8"), file),
    ),
  );
  const issues = validateLessonSet(lessons.map((lesson) => lesson.meta));
  if (issues.length) throw new ContentError("content/", issues);
  return lessons.sort((a, b) => compareLessons(a.meta, b.meta));
}

function loadLessons(): Promise<Lesson[]> {
  if (process.env.NODE_ENV === "development") return readAllLessons();
  lessonsPromise ??= readAllLessons();
  return lessonsPromise;
}

export async function getAllLessons(): Promise<LessonMeta[]> {
  return (await loadLessons()).map((lesson) => lesson.meta);
}

export async function getLessonBySlug(slug: string): Promise<Lesson | undefined> {
  return (await loadLessons()).find((lesson) => lesson.meta.slug === slug);
}

export async function getAdjacentLessons(slug: string) {
  const lessons = await getAllLessons();
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  };
}

export type ModuleGroup = { id: string; title: string; lessons: LessonMeta[] };
export type TrackGroup = { id: string; title: string; description: string; modules: ModuleGroup[] };

export async function getLessonTree(): Promise<TrackGroup[]> {
  const tracks = new Map<string, TrackGroup>();
  for (const lesson of await getAllLessons()) {
    const trackMeta = getTrackMeta(lesson.track);
    let track = tracks.get(lesson.track);
    if (!track) {
      track = {
        id: lesson.track,
        title: trackMeta?.title ?? humanize(lesson.track),
        description: trackMeta?.description ?? "",
        modules: [],
      };
      tracks.set(lesson.track, track);
    }
    let moduleGroup = track.modules.find((group) => group.id === lesson.module);
    if (!moduleGroup) {
      moduleGroup = {
        id: lesson.module,
        title: getModuleMeta(lesson.track, lesson.module)?.title ?? humanize(lesson.module),
        lessons: [],
      };
      track.modules.push(moduleGroup);
    }
    moduleGroup.lessons.push(lesson);
  }
  return [...tracks.values()];
}

async function readJson<T>(
  kind: "problems" | "quizzes",
  id: string,
  schema: z.ZodType<T>,
): Promise<T | undefined> {
  if (!/^[a-z0-9-]+$/.test(id)) return undefined;
  const file = path.join(CONTENT_DIR, kind, `${id}.json`);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return undefined;
  }
  const result = schema.safeParse(JSON.parse(raw));
  if (!result.success) throw new ContentError(`${kind}/${id}.json`, formatZodIssues(result.error));
  return result.data;
}

export function getProblem(id: string): Promise<Problem | undefined> {
  return readJson("problems", id, problemSchema);
}

export function getQuiz(id: string): Promise<Quiz | undefined> {
  return readJson("quizzes", id, quizSchema);
}

export async function listJsonIds(kind: "problems" | "quizzes"): Promise<string[]> {
  try {
    const files = await fs.readdir(path.join(CONTENT_DIR, kind));
    return files.filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -5));
  } catch {
    return [];
  }
}
