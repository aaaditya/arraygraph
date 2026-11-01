"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CodeLanguage } from "@/lib/content/schemas";

export const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 3] as const;
export type PlaybackSpeed = (typeof SPEED_OPTIONS)[number];

type PreferencesState = {
  codeLanguage: CodeLanguage;
  playbackSpeed: PlaybackSpeed;
  setCodeLanguage: (language: CodeLanguage) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      codeLanguage: "python",
      playbackSpeed: 1,
      setCodeLanguage: (codeLanguage) => set({ codeLanguage }),
      setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
    }),
    {
      name: "visualdsa-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ codeLanguage, playbackSpeed }) => ({ codeLanguage, playbackSpeed }),
      skipHydration: true,
    },
  ),
);
