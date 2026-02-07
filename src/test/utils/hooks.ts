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
import { ApiHelper } from "./api-helper";
import { AuthHelper } from "./auth-helper";
import { DataSeeder } from "./DataSeeder";

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
  dataSeeder?: DataSeeder;
  seededData?: any;
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
    headless: true,
    slowMo: 50,
  });

  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(30000);

  this.apiRequest = await request.newContext({
    baseURL: "http://localhost:8080",
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  });
  this.apiHelper = new ApiHelper(this.apiRequest, "http://localhost:8080");
  this.authHelper = new AuthHelper(this.apiRequest, "http://localhost:8080");
  this.dataSeeder = new DataSeeder(this.apiRequest, "http://localhost:8080");

  console.log("=== Browser & Helpers ready ===");
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

  if (this.apiRequest) await this.apiRequest.dispose();

  console.log("=== Browser closed ===");
});

Before({ tags: "not @api and not @ui" }, async function () {
  console.log("=== Starting browser (default) ===");

  this.browser = await chromium.launch({
    headless: true,
    slowMo: 50,
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

/* ==================== DATA SEEDING HOOK ==================== */

let baselineSeedingDone = false;

Before(
  {
    tags: "@PM1 or @PM2 or @PM1-API or @PM1-UI or @PM2-API or @PM2-UI or @plants2-ui",
    timeout: 120000,
  },
  async function (scenario) {
    if (baselineSeedingDone) {
      return;
    }

    console.log(
      `=== Baseline Seed Hook: Preparing data for: ${scenario.pickle.name} ===`,
    );

    const apiRequest = await request.newContext({
      baseURL: "http://localhost:8080",
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });

    try {
      const dataSeeder = new DataSeeder(apiRequest, "http://localhost:8080");
      await dataSeeder.ensureBaselineDataSeeded();
      baselineSeedingDone = true;
    } catch (error) {
      console.error(`✗ Error in baseline seed hook: ${error}`);
    } finally {
      await apiRequest.dispose();
    }

    console.log("=== Baseline Seed Hook: Completed ===\n");
  },
);
