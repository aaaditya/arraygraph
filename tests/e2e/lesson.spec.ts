import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("lesson engine", () => {
  test("lessons index lists the stack chapter and draft chapters", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { level: 1, name: "Lessons" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Stack: The Pile of Plates/ })).toBeVisible();
    await expect(page.getByText("Coming soon").first()).toBeVisible();
  });

  test("stack lesson renders every template section and passes axe", async ({ page }) => {
    await page.goto("/learn/stack-basics");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Stack: The Pile of Plates");
    for (const section of [
      "What you will learn",
      "The story",
      "See it move",
      "Do it by hand",
      "Now the code",
      "How fast is it?",
      "Interview angle",
      "Checkpoint",
      "Practice",
      "Quiz",
      "Recap",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: /Arrays and indexing/i })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("code tabs switch language and remember the choice", async ({ page }) => {
    await page.goto("/learn/stack-basics");
    const tablist = page.getByRole("tablist", { name: "Programming language" });
    const javaTab = tablist.getByRole("tab", { name: "Java", exact: true });
    await expect(async () => {
      await javaTab.click();
      await expect(javaTab).toHaveAttribute("aria-selected", "true", { timeout: 1000 });
    }).toPass();
    await expect(page.getByRole("tabpanel")).toContainText("ArrayList");
    await page.reload();
    await expect(
      page
        .getByRole("tablist", { name: "Programming language" })
        .getByRole("tab", { name: "Java", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
  });

  test("trace, checkpoint and quiz give feedback", async ({ page }) => {
    await page.goto("/learn/stack-basics");
    await page.getByLabel(/What is in the stack at the end/).fill("[1, 3]");
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await expect(page.getByText("Spot on")).toBeVisible();

    const checkpoint = page.getByRole("region", { name: "Checkpoint" });
    await checkpoint.getByRole("radio", { name: "C", exact: true }).check();
    await checkpoint.getByRole("button", { name: "Check answer" }).click();
    await expect(checkpoint.getByText("Correct!")).toBeVisible();

    const quiz = page.getByRole("region", { name: "Quiz" });
    await expect(quiz.getByText("Question 1 of 4")).toBeVisible();
    await quiz.getByRole("radio", { name: "Last In, First Out" }).check();
    await quiz.getByRole("button", { name: "Check answer" }).click();
    await expect(quiz.getByText("Correct!")).toBeVisible();
  });

  test("draft lessons show the coming soon notice", async ({ page }) => {
    await page.goto("/learn/arrays-basics");
    await expect(page.getByText("This lesson is coming soon")).toBeVisible();
  });

  test("signed-in learners can complete a lesson once", async ({ page }) => {
    const email = `lesson-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    await page.goto("/signup?callbackUrl=/learn/stack-basics");
    await page.getByLabel("Name").fill("Lesson Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("plates123");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL((url) => url.pathname === "/learn/stack-basics", { timeout: 60_000 });

    await page.getByRole("button", { name: "Mark lesson complete (+40 XP)" }).click();
    await expect(page.getByText("+40 XP. Nice work!")).toBeVisible();
    await expect(page.getByText("Lesson completed")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Lesson completed")).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.locator("#main").getByText("Total XP").first()).toBeVisible();
    await expect(page.locator("#main").getByText("40", { exact: true }).first()).toBeVisible();
    await expect(page.locator("#main").getByText(/1\s+done/)).toBeVisible();
  });

  test("signed-out learners are invited to sign in to save progress", async ({ page }) => {
    await page.goto("/learn/stack-basics");
    await expect(page.getByText("to save your progress and earn 40 XP")).toBeVisible();
  });
});
