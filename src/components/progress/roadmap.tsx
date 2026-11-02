import Link from "next/link";
import { LessonMetaBadges } from "@/components/lesson/lesson-meta-badges";
import type { TrackGroup } from "@/lib/content/loader";

export type ProgressMap = Record<string, "IN_PROGRESS" | "COMPLETED">;

function ringClass(done: number, total: number) {
  if (total === 0) return "stroke-muted";
  const ratio = done / total;
  if (ratio >= 1) return "stroke-success";
  if (ratio > 0) return "stroke-primary";
  return "stroke-muted";
}

export function ModuleProgressRing({
  done,
  total,
  label,
}: {
  done: number;
  total: number;
  label: string;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : done / total;
  const offset = circumference * (1 - progress);
  return (
    <svg viewBox="0 0 48 48" className="size-12" role="img" aria-label={label}>
      <circle cx="24" cy="24" r={radius} className="stroke-muted fill-none" strokeWidth="4" />
      <circle
        cx="24"
        cy="24"
        r={radius}
        className={`fill-none ${ringClass(done, total)}`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 24 24)"
      />
      <text
        x="24"
        y="25"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        {done}/{total}
      </text>
    </svg>
  );
}

function statusLabel(status: ProgressMap[string] | undefined, locked: boolean) {
  if (locked) return "Locked";
  if (status === "COMPLETED") return "Completed";
  if (status === "IN_PROGRESS") return "In progress";
  return "Not started";
}

export function LearnRoadmap({
  tracks,
  progress,
}: {
  tracks: TrackGroup[];
  progress: ProgressMap;
}) {
  const completed = new Set(
    Object.entries(progress)
      .filter(([, status]) => status === "COMPLETED")
      .map(([slug]) => slug),
  );

  return (
    <div className="mt-10 grid gap-12">
      {tracks.map((track) => {
        const trackLessons = track.modules.flatMap((module) => module.lessons);
        const trackDone = trackLessons.filter((lesson) => completed.has(lesson.slug)).length;
        return (
          <section key={track.id} aria-labelledby={`track-${track.id}`}>
            <div className="flex flex-wrap items-center gap-4">
              <ModuleProgressRing
                done={trackDone}
                total={trackLessons.length}
                label={`${track.title}: ${trackDone} of ${trackLessons.length} lessons complete`}
              />
              <div>
                <h2 id={`track-${track.id}`} className="text-2xl font-bold tracking-tight">
                  {track.title}
                </h2>
                {track.description ? (
                  <p className="text-muted-foreground mt-1">{track.description}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-6 grid gap-8">
              {track.modules.map((module) => {
                const moduleDone = module.lessons.filter((lesson) =>
                  completed.has(lesson.slug),
                ).length;
                return (
                  <div key={module.id}>
                    <div className="flex items-center gap-3">
                      <ModuleProgressRing
                        done={moduleDone}
                        total={module.lessons.length}
                        label={`${module.title}: ${moduleDone} of ${module.lessons.length} complete`}
                      />
                      <h3 className="text-lg font-semibold">{module.title}</h3>
                    </div>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {module.lessons.map((lesson) => {
                        const locked = lesson.prerequisites.some((slug) => !completed.has(slug));
                        const status = progress[lesson.slug];
                        return (
                          <li key={lesson.slug}>
                            <Link
                              href={`/learn/${lesson.slug}`}
                              className="bg-card hover:border-primary focus-visible:ring-ring/50 flex h-full flex-col gap-3 rounded-xl border p-4 transition-colors outline-none focus-visible:ring-[3px]"
                              aria-label={`${lesson.title} (${statusLabel(status, locked)})`}
                            >
                              <span className="text-muted-foreground flex items-center justify-between gap-2 font-mono text-xs">
                                <span>{lesson.chapter}</span>
                                <span>{statusLabel(status, locked)}</span>
                              </span>
                              <span className="font-semibold">{lesson.title}</span>
                              <span className="text-muted-foreground text-sm">
                                Analogy: {lesson.analogy}
                              </span>
                              <LessonMetaBadges lesson={lesson} />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
