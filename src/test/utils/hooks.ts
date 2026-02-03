import {
  Before,
  After,
  setWorldConstructor,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { chromium, Browser, BrowserContext, Page } from "@playwright/test";

setDefaultTimeout(60000);

class CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

setWorldConstructor(CustomWorld);

Before(async function () {
  console.log("=== Starting browser ===");

  this.browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  this.page.setDefaultTimeout(30000);

  console.log("→ Navigating to login page...");
  await this.page.goto("http://localhost:8080/ui/login", {
    waitUntil: "domcontentloaded",
  });

  console.log("=== Browser ready ===");
});

After(async function (scenario) {
  const status = scenario.result?.status;
  console.log(`=== Test ${scenario.pickle.name}: ${status} ===`);

  if (status === "FAILED" && this.page && !this.page.isClosed()) {
    await this.page.waitForTimeout(2000);
  }

  if (this.page && !this.page.isClosed()) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();

  console.log("=== Browser closed ===");
});
