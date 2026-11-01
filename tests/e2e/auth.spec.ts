import { expect, test } from "@playwright/test";

const uniqueEmail = () => `learner-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

test.describe("authentication", () => {
  test("protected pages redirect to sign in", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/signin\?callbackUrl=/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("sign up validates input", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name", { exact: true }).fill("Asha");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Enter a valid email")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters")).toBeVisible();
  });

  test("sign up, edit profile, sign out, sign back in", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto("/signup?callbackUrl=/profile");
    await page.getByLabel("Name", { exact: true }).fill("Asha Rao");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("plates123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "Your profile" })).toBeVisible();

    await page.getByLabel("Name", { exact: true }).fill("Asha Priya Rao");
    await page.getByLabel("Bio").fill("Chai and code.");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText("Profile saved.")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Asha Priya Rao");

    await page.getByRole("button", { name: "Open account menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();

    await page.goto("/signin?callbackUrl=/profile");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-pass1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("do not match")).toBeVisible();

    await page.getByLabel("Password").fill("plates123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/profile$/);
  });

  test("duplicate email is rejected", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name", { exact: true }).fill("Demo");
    await page.getByLabel("Email").fill("demo@visualdsa.dev");
    await page.getByLabel("Password").fill("plates123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("already exists")).toBeVisible();
  });
});
