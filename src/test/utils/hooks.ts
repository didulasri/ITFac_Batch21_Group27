import {
  Before,
  After,
  setWorldConstructor,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import {
  chromium,
  Browser,
  BrowserContext,
  Page,
  request,
  APIRequestContext,
} from "@playwright/test";

setDefaultTimeout(60000);

class CustomWorld {
  // UI Testing
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  baseUrl?: string;

  // API Testing
  apiRequest?: APIRequestContext;
  apiBaseUrl?: string;
  apiResponse?: any;
  responseBody?: any;
  userRole?: string;
  apiHelper?: any;
  authHelper?: any;
}

setWorldConstructor(CustomWorld);

/* ==================== API HOOKS ==================== */

Before({ tags: "@api" }, async function () {
  console.log("=== Setting up API context ===");
  this.apiRequest = await request.newContext({
    baseURL: "http://localhost:8080",
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  });
  console.log("=== API context ready ===");
});

After({ tags: "@api" }, async function (scenario) {
  const status = scenario.result?.status || "UNKNOWN";
  console.log(`=== API Test ${scenario.pickle.name}: ${status} ===`);

  if (this.apiRequest) {
    await this.apiRequest.dispose();
  }

  console.log("=== API context disposed ===");
});

/* ==================== UI HOOKS ==================== */

Before({ tags: "@ui" }, async function () {
  console.log("=== Starting browser for UI test ===");

  this.browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(30000);

  console.log("=== Browser ready ===");
});

After({ tags: "@ui" }, async function (scenario) {
  const status = scenario.result?.status || "UNKNOWN";
  console.log(`=== UI Test ${scenario.pickle.name}: ${status} ===`);

  if (status === "FAILED" && this.page && !this.page.isClosed()) {
    console.log("Test failed - waiting 2 seconds...");
    await this.page.waitForTimeout(2000);
  }

  if (this.page && !this.page.isClosed()) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();

  console.log("=== Browser closed ===");
});

/* ==================== DEFAULT HOOKS (for untagged scenarios) ==================== */

Before({ tags: "not @api and not @ui" }, async function () {
  console.log("=== Starting browser (default) ===");

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

After({ tags: "not @api and not @ui" }, async function (scenario) {
  const status = scenario.result?.status || "UNKNOWN";
  console.log(`=== Test ${scenario.pickle.name}: ${status} ===`);

  if (status === "FAILED" && this.page && !this.page.isClosed()) {
    await this.page.waitForTimeout(2000);
  }

  if (this.page && !this.page.isClosed()) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();

  console.log("=== Browser closed ===");
});