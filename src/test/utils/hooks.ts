import {
  Before,
  After,
  setWorldConstructor,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { chromium, Browser, BrowserContext, Page } from "@playwright/test";

setDefaultTimeout(60000);

class CustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
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

  console.log("=== Browser ready ===");
});

After(async function (scenario) {
  console.log(
    `=== Test ${scenario.pickle.name}: ${scenario.result?.status} ===`,
  );

  if (scenario.result?.status === "FAILED") {
    await this.page.waitForTimeout(2000);
  }

  await this.page.close();
  await this.context.close();
  await this.browser.close();

  console.log("=== Browser closed ===");
});
