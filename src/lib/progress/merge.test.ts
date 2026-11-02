import { describe, expect, it } from "vitest";
import { emptyGuestProgress, mergeGuestIntoServer, mergeLessonLists, pickNewer } from "./merge";

describe("pickNewer", () => {
  it("keeps the server row when guest is older or equal", () => {
    const server = { updatedAt: "2026-01-02T00:00:00.000Z", value: "server" };
    const guest = { updatedAt: "2026-01-01T00:00:00.000Z", value: "guest" };
    expect(pickNewer(server, guest).value).toBe("server");
    expect(pickNewer(server, { ...guest, updatedAt: server.updatedAt }).value).toBe("server");
  });

  it("takes the guest row when it is newer", () => {
    const server = { updatedAt: "2026-01-01T00:00:00.000Z", value: "server" };
    const guest = { updatedAt: "2026-01-02T00:00:00.000Z", value: "guest" };
    expect(pickNewer(server, guest).value).toBe("guest");
    expect(pickNewer(null, guest).value).toBe("guest");
  });
});

describe("mergeGuestIntoServer", () => {
  it("merges lessons and drafts without overwriting newer server data", () => {
    const server = {
      ...emptyGuestProgress(),
      lessons: [
        {
          lessonSlug: "stack-basics",
          status: "COMPLETED" as const,
          lastSection: "recap",
          updatedAt: "2026-02-01T12:00:00.000Z",
        },
      ],
      drafts: [
        {
          problemId: "min-stack",
          language: "typescript",
          code: "server",
          updatedAt: "2026-02-01T12:00:00.000Z",
        },
      ],
      savedAt: "2026-02-01T12:00:00.000Z",
    };
    const guest = {
      ...emptyGuestProgress(),
      lessons: [
        {
          lessonSlug: "stack-basics",
          status: "IN_PROGRESS" as const,
          lastSection: "analogy",
          updatedAt: "2026-01-01T12:00:00.000Z",
        },
        {
          lessonSlug: "arrays-basics",
          status: "IN_PROGRESS" as const,
          lastSection: "start",
          updatedAt: "2026-02-02T12:00:00.000Z",
        },
      ],
      drafts: [
        {
          problemId: "min-stack",
          language: "typescript",
          code: "guest-old",
          updatedAt: "2026-01-01T12:00:00.000Z",
        },
        {
          problemId: "valid-parentheses",
          language: "python",
          code: "guest-new",
          updatedAt: "2026-02-03T12:00:00.000Z",
        },
      ],
      savedAt: "2026-02-03T12:00:00.000Z",
    };

    const merged = mergeGuestIntoServer(server, guest);
    expect(mergeLessonLists(server.lessons, guest.lessons)).toHaveLength(2);
    expect(merged.lessons.find((l) => l.lessonSlug === "stack-basics")?.status).toBe("COMPLETED");
    expect(merged.lessons.find((l) => l.lessonSlug === "arrays-basics")?.lastSection).toBe("start");
    expect(merged.drafts.find((d) => d.problemId === "min-stack")?.code).toBe("server");
    expect(merged.drafts.find((d) => d.problemId === "valid-parentheses")?.code).toBe("guest-new");
  });
});
