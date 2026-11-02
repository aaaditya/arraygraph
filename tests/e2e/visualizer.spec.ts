import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const visualizer = (page: Page, name = "Your stack") => page.getByRole("group", { name });

test.describe("stack visualizer", () => {
  test("playground is keyboard operable and passes axe", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/visualizers/stack");
    const player = visualizer(page);
    await expect(player.getByText("Step 1 of 12")).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);

    await player.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(player.getByText("Step 3 of 12")).toBeVisible();
    await expect(player.locator("[aria-live='polite']")).toContainText("5 goes on top");
    await expect(player.locator("[aria-current='step']")).toContainText("items.append(x)");

    await page.keyboard.press("ArrowLeft");
    await expect(player.getByText("Step 2 of 12")).toBeVisible();
    await page.keyboard.press("End");
    await expect(player.getByText("Step 12 of 12")).toBeVisible();
    await page.keyboard.press("Home");
    await expect(player.getByText("Step 1 of 12")).toBeVisible();
  });

  test("play runs to the end", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/visualizers/stack");
    const player = visualizer(page);
    await player.getByLabel("Speed").selectOption("3");
    await expect(player.getByLabel("Speed")).toHaveValue("3");
    await player.getByRole("button", { name: "Play" }).click();
    await expect(player.getByRole("button", { name: "Pause" })).toBeVisible();
    await expect(player.getByText("Step 12 of 12")).toBeVisible({ timeout: 20_000 });
    await expect(player.getByRole("button", { name: "Play" })).toBeVisible();
  });

  test("custom operations and validation", async ({ page }) => {
    await page.goto("/visualizers/stack");
    const ops = page.getByLabel("Operations (one per line)");
    await ops.fill("push 1\nfly");
    await expect(page.getByText('unknown operation "fly"')).toBeVisible();
    await expect(page.getByRole("button", { name: "Visualize" })).toBeDisabled();

    await page.getByLabel(/Starting stack/).fill("");
    await ops.fill("push 1\npush 2\npop\npush 3");
    await page.getByRole("button", { name: "Visualize" }).click();
    const player = visualizer(page);
    await player.focus();
    await page.keyboard.press("End");
    await expect(player.locator("[aria-live='polite']")).toContainText("Bottom to top: 1, 3");
  });

  test("underflow preset explains the error", async ({ page }) => {
    await page.goto("/visualizers/stack");
    await page.getByRole("button", { name: "Underflow" }).click();
    const player = visualizer(page);
    await player.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(player.locator("[aria-live='polite']")).toContainText("underflow");
  });

  test("stack lesson embeds the visualizer", async ({ page }) => {
    await page.goto("/learn/stack-basics");
    const player = visualizer(page, "Stack visualizer");
    await expect(player).toBeVisible();
    await expect(player.getByText(/Step 1 of \d+/)).toBeVisible();
  });

  test("visualizers index links to the stack visualizer", async ({ page }) => {
    await page.goto("/visualizers");
    await page.getByRole("link", { name: /Stack/ }).click();
    await page.waitForURL((url) => url.pathname === "/visualizers/stack");
  });
});
