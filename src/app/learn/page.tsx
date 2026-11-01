import type { Metadata } from "next";
import Link from "next/link";
import { LessonMetaBadges } from "@/components/lesson/lesson-meta-badges";
import { getLessonTree } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Lessons",
  description:
    "Browse VisualDSA lessons by track and module. Every lesson starts with a real-life analogy.",
  alternates: { canonical: "/learn" },
};

export default async function LearnPage() {
  const tracks = await getLessonTree();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Lessons</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Analogy first, visuals second, code last. Lessons marked Coming soon are being written.
      </p>

      <div className="mt-10 grid gap-12">
        {tracks.map((track) => (
          <section key={track.id} aria-labelledby={`track-${track.id}`}>
            <h2 id={`track-${track.id}`} className="text-2xl font-bold tracking-tight">
              {track.title}
            </h2>
            {track.description ? (
              <p className="text-muted-foreground mt-1">{track.description}</p>
            ) : null}
            <div className="mt-6 grid gap-8">
              {track.modules.map((module) => (
                <div key={module.id}>
                  <h3 className="text-lg font-semibold">{module.title}</h3>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <Link
                          href={`/learn/${lesson.slug}`}
                          className="bg-card hover:border-primary focus-visible:ring-ring/50 flex h-full flex-col gap-3 rounded-xl border p-4 transition-colors outline-none focus-visible:ring-[3px]"
                        >
                          <span className="text-muted-foreground font-mono text-xs">
                            {lesson.chapter}
                          </span>
                          <span className="font-semibold">{lesson.title}</span>
                          <span className="text-muted-foreground text-sm">
                            Analogy: {lesson.analogy}
                          </span>
                          <LessonMetaBadges lesson={lesson} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
