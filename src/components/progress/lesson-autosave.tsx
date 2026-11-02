"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { saveLessonProgressAction } from "@/lib/progress/actions";
import { useGuestProgress } from "@/stores/guest-progress";

const DEBOUNCE_MS = 800;
const RETRY_MS = 4000;

type PendingSave = {
  lessonSlug: string;
  lastSection: string | null;
  scrollPosition: number;
};

/**
 * Watches scroll + hash and debounces progress saves.
 * Signed-in users hit the server; guests write localStorage. Failed server saves retry while online.
 */
export function LessonAutosave({
  lessonSlug,
  initialSection,
}: {
  lessonSlug: string;
  initialSection?: string | null;
}) {
  const { status } = useSession();
  const timer = useRef<number | null>(null);
  const pending = useRef<PendingSave | null>(null);
  const retryTimer = useRef<number | null>(null);

  useEffect(() => {
    function currentSection() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) return hash;
      const headings = [...document.querySelectorAll<HTMLElement>("main h2[id], main h3[id]")];
      let active = initialSection ?? null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 120) active = heading.id;
      }
      return active;
    }

    async function flush() {
      const payload = pending.current;
      if (!payload || status === "loading") return;
      if (status === "authenticated") {
        try {
          const result = await saveLessonProgressAction(payload);
          if (!result.ok) throw new Error(result.reason);
          pending.current = null;
        } catch {
          if (retryTimer.current) window.clearTimeout(retryTimer.current);
          retryTimer.current = window.setTimeout(() => {
            if (navigator.onLine) void flush();
          }, RETRY_MS);
        }
        return;
      }
      useGuestProgress.getState().upsertLesson({
        lessonSlug: payload.lessonSlug,
        status: "IN_PROGRESS",
        lastSection: payload.lastSection,
        scrollPosition: payload.scrollPosition,
        updatedAt: new Date().toISOString(),
      });
      pending.current = null;
    }

    function schedule() {
      pending.current = {
        lessonSlug,
        lastSection: currentSection(),
        scrollPosition: Math.round(window.scrollY),
      };
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void flush(), DEBOUNCE_MS);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("hashchange", schedule);
    window.addEventListener("online", () => void flush());
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("hashchange", schedule);
      window.removeEventListener("online", () => void flush());
      if (timer.current) window.clearTimeout(timer.current);
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
    };
  }, [lessonSlug, initialSection, status]);

  return null;
}
