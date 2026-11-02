/**
 * Validates everything in /content: lesson frontmatter, folder layout, prerequisites, problem and
 * quiz JSON, and references from lessons to problems/quizzes.
 * Missing problems in draft lessons are warnings; anything broken in a ready lesson is an error.
 */
import {
  getAllLessons,
  getLessonBySlug,
  getProblem,
  getQuiz,
  listJsonIds,
} from "../src/lib/content/loader";
import { extractReferences } from "../src/lib/content/parse";

async function main() {
  const errors: string[] = [];
  const warnings: string[] = [];

  const lessons = await getAllLessons().catch((error: Error) => {
    errors.push(error.message);
    return [];
  });

  for (const kind of ["problems", "quizzes"] as const) {
    for (const id of await listJsonIds(kind)) {
      try {
        const item = kind === "problems" ? await getProblem(id) : await getQuiz(id);
        if (item && item.id !== id)
          errors.push(`${kind}/${id}.json: id "${item.id}" must match file name`);
      } catch (error) {
        errors.push((error as Error).message);
      }
    }
  }

  const problemIds = new Set(await listJsonIds("problems"));
  const quizIds = new Set(await listJsonIds("quizzes"));

  for (const meta of lessons) {
    const lesson = await getLessonBySlug(meta.slug);
    if (!lesson) continue;
    const refs = extractReferences(lesson.body);
    const report = meta.status === "ready" ? errors : warnings;
    for (const id of refs.problemIds) {
      if (!problemIds.has(id)) report.push(`${meta.filePath}: problem "${id}" not found`);
    }
    for (const id of refs.quizIds) {
      if (!quizIds.has(id)) report.push(`${meta.filePath}: quiz "${id}" not found`);
    }
  }

  for (const warning of warnings) console.warn(`warn  ${warning}`);
  for (const error of errors) console.error(`error ${error}`);
  const ready = lessons.filter((lesson) => lesson.status === "ready").length;
  console.log(
    `\nChecked ${lessons.length} lessons (${ready} ready), ${problemIds.size} problems, ${quizIds.size} quizzes.`,
  );
  if (errors.length) {
    console.error(`${errors.length} error(s).`);
    process.exit(1);
  }
  console.log(warnings.length ? `OK with ${warnings.length} warning(s).` : "OK.");
}

void main();
