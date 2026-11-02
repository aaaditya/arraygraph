import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MainNav, isActivePath } from "./main-nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/visualizers/queue" }));

describe("isActivePath", () => {
  it("matches the home route exactly", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/learn", "/")).toBe(false);
  });

  it("matches nested routes within the same section", () => {
    expect(isActivePath("/learn/stack-basics", "/learn")).toBe(true);
    expect(isActivePath("/visualizers/queue", "/visualizers")).toBe(true);
    expect(isActivePath("/visualizers/queue", "/visualizers/stack")).toBe(true);
    expect(isActivePath("/learning", "/learn")).toBe(false);
  });
});

describe("MainNav", () => {
  it("marks the active link with aria-current", () => {
    render(
      <MainNav
        items={[
          { href: "/learn", label: "Learn" },
          { href: "/visualizers", label: "Visualizers" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Visualizers" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Learn" })).not.toHaveAttribute("aria-current");
  });
});
