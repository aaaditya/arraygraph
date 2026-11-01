import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("site shell", () => {
  test("home page renders the hero and passes axe", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VisualDSA/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("teach a child");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("dark mode toggle switches the theme", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const wasDark = (await html.getAttribute("class"))?.includes("dark") ?? false;
    await page.getByRole("button", { name: "Toggle dark mode" }).click();
    if (wasDark) await expect(html).not.toHaveClass(/dark/);
    else await expect(html).toHaveClass(/dark/);
  });

  test("dark mode passes axe", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("unknown routes show the 404 page", async ({ page }) => {
    const response = await page.goto("/definitely-not-here");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /fell off the stack/ })).toBeVisible();
  });

  test("seo routes respond", async ({ request }) => {
    expect((await request.get("/robots.txt")).ok()).toBe(true);
    expect((await request.get("/sitemap.xml")).ok()).toBe(true);
    expect((await request.get("/manifest.webmanifest")).ok()).toBe(true);
  });
});
