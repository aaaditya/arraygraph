import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the original password and rejects others", async () => {
    const hash = await hashPassword("pile-of-plates");
    expect(hash).not.toContain("pile-of-plates");
    await expect(verifyPassword("pile-of-plates", hash)).resolves.toBe(true);
    await expect(verifyPassword("pile-of-plate", hash)).resolves.toBe(false);
  });
});
