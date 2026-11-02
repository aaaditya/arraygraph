"use client";

import { CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { completeLessonAction } from "@/lib/progress/actions";

export function CompleteLessonButton({ slug, xp }: { slug: string; xp: number }) {
  const { status } = useSession();
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (status !== "authenticated") return;
    const controller = new AbortController();
    fetch(`/api/progress/lessons/${slug}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { completed: false }))
      .then((data: { completed: boolean }) => setCompleted(data.completed))
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setCompleted(false);
      });
    return () => controller.abort();
  }, [slug, status]);

  if (status === "unauthenticated") {
    return (
      <p className="text-muted-foreground text-sm">
        <Link
          href={`/login?callbackUrl=/learn/${slug}`}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Sign in
        </Link>{" "}
        to save your progress and earn {xp} XP.
      </p>
    );
  }

  if (status === "loading" || completed === null) {
    return <Skeleton className="h-10 w-64" />;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {completed ? (
        <p className="text-success flex items-center gap-2 font-medium">
          <CheckCircle2Icon className="size-5" aria-hidden="true" /> Lesson completed
        </p>
      ) : (
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await completeLessonAction(slug);
              if (result.ok) {
                setCompleted(true);
                setMessage(
                  result.xpAwarded > 0 ? `+${result.xpAwarded} XP. Nice work!` : "Already counted.",
                );
              } else {
                setMessage("We could not save that. Please sign in again.");
              }
            })
          }
        >
          {pending ? "Saving…" : `Mark lesson complete (+${xp} XP)`}
        </Button>
      )}
      <p aria-live="polite" className="text-sm font-medium">
        {message}
      </p>
    </div>
  );
}
