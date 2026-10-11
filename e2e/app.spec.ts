import { expect, test } from "@playwright/test";

test("shows the app heading", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("increments the counter when clicked", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "count is 0" }).click();

  await expect(page.getByRole("button", { name: "count is 1" })).toBeVisible();
});
