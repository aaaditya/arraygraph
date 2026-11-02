"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  emptyGuestProgress,
  type GuestCodeDraft,
  type GuestLessonProgress,
  type GuestProgressBlob,
} from "@/lib/progress/merge";

type GuestProgressState = GuestProgressBlob & {
  upsertLesson: (lesson: GuestLessonProgress) => void;
  upsertDraft: (draft: GuestCodeDraft) => void;
  clear: () => void;
  hydrateFrom: (blob: GuestProgressBlob) => void;
};

export const useGuestProgress = create<GuestProgressState>()(
  persist(
    (set, get) => ({
      ...emptyGuestProgress(),
      upsertLesson: (lesson) => {
        const lessons = [
          ...get().lessons.filter((row) => row.lessonSlug !== lesson.lessonSlug),
          lesson,
        ];
        set({ lessons, savedAt: new Date().toISOString() });
      },
      upsertDraft: (draft) => {
        const drafts = [
          ...get().drafts.filter(
            (row) => !(row.problemId === draft.problemId && row.language === draft.language),
          ),
          draft,
        ];
        set({ drafts, savedAt: new Date().toISOString() });
      },
      clear: () => set(emptyGuestProgress()),
      hydrateFrom: (blob) => set({ ...blob }),
    }),
    {
      name: "visualdsa.guest-progress.v1",
      skipHydration: true,
      partialize: (state) => ({
        version: state.version,
        lessons: state.lessons,
        drafts: state.drafts,
        savedAt: state.savedAt,
      }),
    },
  ),
);

export function guestProgressSnapshot(): GuestProgressBlob {
  const { version, lessons, drafts, savedAt } = useGuestProgress.getState();
  return { version, lessons, drafts, savedAt };
}
