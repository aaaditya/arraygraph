import { describe, expect, it } from "vitest";
import { initials } from "./user-nav";

describe("initials", () => {
  it("uses first and last name initials", () => {
    expect(initials("Asha Priya Rao")).toBe("AR");
  });

  it("falls back to the first two letters of a single name", () => {
    expect(initials("Ravi")).toBe("RA");
  });

  it("falls back to the email local part", () => {
    expect(initials(null, "chai@stall.in")).toBe("CH");
    expect(initials("  ", undefined)).toBe("?");
  });
});
