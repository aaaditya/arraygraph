/**
 * Guest → account merge helpers.
 * Prefer the side with the newer `updatedAt`. Equal timestamps keep the server copy.
 */

export type Timestamped = { updatedAt: string | Date };

export function pickNewer<T extends Timestamped>(server: T | null | undefined, guest: T): T {
  if (!server) return guest;
  const serverMs = new Date(server.updatedAt).getTime();
  const guestMs = new Date(guest.updatedAt).getTime();
  return guestMs > serverMs ? guest : server;
}

export type GuestLessonProgress = {
  lessonSlug: string;
  status: "IN_PROGRESS" | "COMPLETED";
  lastSection?: string | null;
  scrollPosition?: number;
  visualizerState?: unknown;
  quizState?: unknown;
  completedAt?: string | null;
  updatedAt: string;
};

export type GuestCodeDraft = {
  problemId: string;
  language: string;
  code: string;
  updatedAt: string;
};

export type GuestProgressBlob = {
  version: 1;
  lessons: GuestLessonProgress[];
  drafts: GuestCodeDraft[];
  savedAt: string;
};

export function emptyGuestProgress(): GuestProgressBlob {
  return { version: 1, lessons: [], drafts: [], savedAt: new Date(0).toISOString() };
}

export function mergeLessonLists(
  server: GuestLessonProgress[],
  guest: GuestLessonProgress[],
): GuestLessonProgress[] {
  const bySlug = new Map(server.map((row) => [row.lessonSlug, row]));
  for (const row of guest) {
    const existing = bySlug.get(row.lessonSlug);
    bySlug.set(row.lessonSlug, pickNewer(existing, row));
  }
  return [...bySlug.values()];
}

export function mergeDraftLists(
  server: GuestCodeDraft[],
  guest: GuestCodeDraft[],
): GuestCodeDraft[] {
  const key = (row: GuestCodeDraft) => `${row.problemId}::${row.language}`;
  const byKey = new Map(server.map((row) => [key(row), row]));
  for (const row of guest) {
    const existing = byKey.get(key(row));
    byKey.set(key(row), pickNewer(existing, row));
  }
  return [...byKey.values()];
}

export function mergeGuestIntoServer(
  server: GuestProgressBlob,
  guest: GuestProgressBlob,
): GuestProgressBlob {
  return {
    version: 1,
    lessons: mergeLessonLists(server.lessons, guest.lessons),
    drafts: mergeDraftLists(server.drafts, guest.drafts),
    savedAt: new Date(
      Math.max(new Date(server.savedAt).getTime(), new Date(guest.savedAt).getTime()),
    ).toISOString(),
  };
}
