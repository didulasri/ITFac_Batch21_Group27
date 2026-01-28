// 1) Log in once and save storage state
import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://localhost:8080/ui/login");
  await page.fill("#username", "admin");
  await page.fill("#password", "admin123");
  await page.click("button[type='submit']");
  await page.waitForSelector("text=Plants");

  // Save storage state (cookies, localStorage)
  await context.storageState({ path: "storageState.json" });

  await browser.close();
})();
