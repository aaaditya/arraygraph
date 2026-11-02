import type { Metadata } from "next";
import { auth } from "@/auth";
import { LearnRoadmap, type ProgressMap } from "@/components/progress/roadmap";
import { db } from "@/lib/db";
import { getLessonTree } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Lessons",
  description:
    "Browse VisualDSA lessons by track and module. Every lesson starts with a real-life analogy.",
  alternates: { canonical: "/learn" },
};

export default async function LearnPage() {
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
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Lessons</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Analogy first, visuals second, code last. Lessons marked Coming soon are being written.
        Signed-in progress shows as completed, in progress, or locked by prerequisites.
      </p>
      <LearnRoadmap tracks={tracks} progress={progress} />
    </div>
  );
}
