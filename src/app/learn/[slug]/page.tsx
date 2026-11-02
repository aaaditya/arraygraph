import { ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteLessonButton } from "@/components/lesson/complete-lesson-button";
import { LessonMetaBadges } from "@/components/lesson/lesson-meta-badges";
import { LessonAutosave } from "@/components/progress/lesson-autosave";
import { getModuleMeta, getTrackMeta, humanize } from "@/lib/content/catalog";
import { getAdjacentLessons, getAllLessons, getLessonBySlug } from "@/lib/content/loader";
import { renderLessonBody } from "@/lib/content/mdx";
import { extractToc } from "@/lib/content/parse";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllLessons()).map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const lesson = await getLessonBySlug((await params).slug);
  if (!lesson) return {};
  const description =
    lesson.meta.summary ??
    `Learn ${lesson.meta.title} through the analogy of ${lesson.meta.analogy}.`;
  return {
    title: lesson.meta.title,
    description,
    keywords: lesson.meta.tags,
    alternates: { canonical: `/learn/${lesson.meta.slug}` },
    openGraph: { type: "article", title: lesson.meta.title, description },
    robots: lesson.meta.status === "draft" ? { index: false } : undefined,
  };
}

export default async function LessonPage({ params }: Params) {
  const lesson = await getLessonBySlug((await params).slug);
  if (!lesson) notFound();

  const { meta, body } = lesson;
  const [content, adjacent, allLessons] = await Promise.all([
    renderLessonBody(body),
    getAdjacentLessons(meta.slug),
    getAllLessons(),
  ]);
  const toc = extractToc(body);
  const prerequisites = meta.prerequisites
    .map((slug) => allLessons.find((candidate) => candidate.slug === slug))
    .filter((candidate) => candidate !== undefined);
  const trackTitle = getTrackMeta(meta.track)?.title ?? humanize(meta.track);
  const moduleTitle = getModuleMeta(meta.track, meta.module)?.title ?? humanize(meta.module);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_220px]">
      <LessonAutosave lessonSlug={meta.slug} />
      <article className="min-w-0">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                href="/learn"
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                Lessons
              </Link>
            </li>
            <li className="flex items-center gap-1">
              <ChevronRightIcon className="size-4" aria-hidden="true" />
              {trackTitle}
            </li>
            <li className="flex items-center gap-1" aria-current="page">
              <ChevronRightIcon className="size-4" aria-hidden="true" />
              {moduleTitle}
            </li>
          </ol>
        </nav>

        <header className="mt-4">
          <p className="text-primary font-mono text-sm font-semibold">Chapter {meta.chapter}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {meta.title}
          </h1>
          <div className="mt-4">
            <LessonMetaBadges lesson={meta} />
          </div>
          {prerequisites.length ? (
            <p className="text-muted-foreground mt-4 text-sm">
              Before this:{" "}
              {prerequisites.map((prerequisite, index) => (
                <span key={prerequisite.slug}>
                  {index > 0 ? ", " : null}
                  <Link
                    href={`/learn/${prerequisite.slug}`}
                    className="text-primary font-medium underline-offset-4 hover:underline"
                  >
                    {prerequisite.title}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </header>

        {meta.status === "draft" ? (
          <div role="note" className="bg-warning/15 border-warning mt-6 rounded-xl border p-4">
            <p className="font-semibold">This lesson is coming soon</p>
            <p className="text-sm">
              You can preview the outline below. The full lesson is being written.
            </p>
          </div>
        ) : null}

        <div className="prose-lesson mt-8">{content}</div>

        {meta.status === "ready" ? (
          <div className="mt-10 border-t pt-6">
            <CompleteLessonButton slug={meta.slug} xp={meta.xp} />
          </div>
        ) : null}

        <nav aria-label="Lesson navigation" className="mt-10 grid gap-3 sm:grid-cols-2">
          {adjacent.previous ? (
            <Link
              href={`/learn/${adjacent.previous.slug}`}
              className="hover:border-primary flex flex-col rounded-xl border p-4 transition-colors"
            >
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <ArrowLeftIcon className="size-3" aria-hidden="true" /> Previous
              </span>
              <span className="font-medium">{adjacent.previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link
              href={`/learn/${adjacent.next.slug}`}
              className="hover:border-primary flex flex-col rounded-xl border p-4 text-right transition-colors"
            >
              <span className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
                Next <ArrowRightIcon className="size-3" aria-hidden="true" />
              </span>
              <span className="font-medium">{adjacent.next.title}</span>
            </Link>
          ) : null}
        </nav>
      </article>

      {toc.length ? (
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24">
            <p className="text-sm font-semibold">On this page</p>
            <ul className="text-muted-foreground mt-3 grid gap-2 border-l text-sm">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="hover:text-foreground -ml-px block border-l border-transparent pl-3 hover:border-current"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      ) : null}
    </div>
  );
}
