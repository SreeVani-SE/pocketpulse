import { test, expect } from "@playwright/test";

test("App loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("PocketPulse")).toBeVisible();
});
