import { expect, test } from "@playwright/test";

const uniqueEmail = () => `progress-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

test.describe("progress resume", () => {
  test("signup, autosave section, logout, login on a fresh browser and resume", async ({
    browser,
    page,
  }) => {
    test.setTimeout(90_000);
    const email = uniqueEmail();
    const password = "plates123";

    await page.goto("/signup?callbackUrl=/learn/stack-basics");
    await page.getByLabel("Name", { exact: true }).fill("Progress Learner");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL((url) => url.pathname === "/learn/stack-basics", { timeout: 60_000 });

    const section = page.locator("main h2[id]").nth(1);
    await expect(section).toBeVisible();
    const sectionId = await section.getAttribute("id");
    expect(sectionId).toBeTruthy();
    await page.evaluate((id) => {
      window.location.hash = id!;
      window.scrollTo(0, document.getElementById(id!)?.offsetTop ?? 0);
    }, sectionId);
    // Debounced autosave (800ms) + server write.
    await page.waitForTimeout(2000);

    await page.getByRole("button", { name: "Open account menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page.waitForURL((url) => url.pathname === "/");

    const other = await browser.newPage();
    await other.goto("/login?callbackUrl=/dashboard");
    await other.getByLabel("Email").fill(email);
    await other.getByLabel("Password").fill(password);
    await other.getByRole("button", { name: "Sign in" }).click();
    await other.waitForURL((url) => url.pathname === "/dashboard", { timeout: 60_000 });

    await expect(other.getByText("Continue learning")).toBeVisible();
    await other
      .getByRole("link", { name: /Resume lesson|Continue:/ })
      .first()
      .click();
    await other.waitForURL((url) => url.pathname === "/learn/stack-basics");
    await expect(other).toHaveURL(new RegExp(`#${sectionId}`));

    await other.close();
  });
});
