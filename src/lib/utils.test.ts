import { describe, expect, it } from "vitest";
import { absoluteUrl, cn } from "./utils";

describe("cn", () => {
  it("merges conflicting tailwind classes, last one wins", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });
});

describe("absoluteUrl", () => {
  it("joins a path to a base url", () => {
    expect(absoluteUrl("/learn", "https://visualdsa.dev")).toBe("https://visualdsa.dev/learn");
  });
});
