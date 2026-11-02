import { auth } from "@/auth";
import { ContinueLearningCard } from "@/components/progress/continue-learning";
import { db } from "@/lib/db";

export async function ContinueSlot() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const resume = await db.lessonProgress.findFirst({
    where: { userId: session.user.id, status: "IN_PROGRESS" },
    orderBy: { updatedAt: "desc" },
    select: { lessonSlug: true, lastSection: true },
  });
  if (!resume) return null;
  return (
    <ContinueLearningCard lessonSlug={resume.lessonSlug} lastSection={resume.lastSection} compact />
  );
}
