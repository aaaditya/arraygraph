import type { Metadata } from "next";
import { auth } from "@/auth";
import { LearnRoadmap, type ProgressMap } from "@/components/progress/roadmap";
import { getLessonTree } from "@/lib/content/loader";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Every VisualDSA track, module and chapter with prerequisite locks and progress rings.",
  alternates: { canonical: "/roadmap" },
};

export default async function RoadmapPage() {
  const tracks = await getLessonTree();
  const session = await auth();
  let progress: ProgressMap = {};
  if (session?.user?.id) {
    const rows = await db.lessonProgress.findMany({
      where: { userId: session.user.id },
      select: { lessonSlug: true, status: true },
    });
    progress = Object.fromEntries(rows.map((row) => [row.lessonSlug, row.status]));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Roadmap</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Built from lesson frontmatter. Complete prerequisites to unlock the next chapter. Drafts
        show as Coming soon until they are ready.
      </p>
      <LearnRoadmap tracks={tracks} progress={progress} />
    </div>
  );
}
