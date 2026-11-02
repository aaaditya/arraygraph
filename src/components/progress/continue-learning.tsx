import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLessonBySlug } from "@/lib/content/loader";

export async function ContinueLearningCard({
  lessonSlug,
  lastSection,
  compact = false,
}: {
  lessonSlug: string;
  lastSection?: string | null;
  compact?: boolean;
}) {
  const lesson = await getLessonBySlug(lessonSlug);
  if (!lesson) return null;
  const href = lastSection
    ? `/learn/${lesson.meta.slug}#${lastSection}`
    : `/learn/${lesson.meta.slug}`;

  if (compact) {
    return (
      <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
        <Link href={href}>Continue: {lesson.meta.title}</Link>
      </Button>
    );
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Continue learning
        </p>
        <p className="mt-1 text-xl font-semibold">{lesson.meta.title}</p>
        <p className="text-muted-foreground text-sm">
          {lastSection ? `Resume at #${lastSection}` : "Pick up where you left off"}
        </p>
      </div>
      <Button asChild>
        <Link href={href}>Resume lesson</Link>
      </Button>
    </div>
  );
}
