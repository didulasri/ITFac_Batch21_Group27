import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ApiHelper } from "../utils/api-helper";
import { AuthHelper } from "../utils/auth-helper";

Given("the user is logged in as Admin", async function () {
  await this.page.goto("http://localhost:8080/ui/login");

  await this.page.waitForSelector('input[name="username"]', {
    state: "visible",
  });
  await this.page.fill('input[name="username"]', "admin");
  await this.page.fill('input[name="password"]', "admin123");
  await this.page.click('button[type="submit"]');

  await this.page.waitForLoadState("networkidle");
  console.log("Admin login complete");
});

Given("the user is logged in as User", async function () {
  await this.page.goto("http://localhost:8080/ui/login");

  await this.page.waitForSelector('input[name="username"]', {
    state: "visible",
  });
  await this.page.fill('input[name="username"]', "testuser");
  await this.page.fill('input[name="password"]', "test123");
  await this.page.click('button[type="submit"]');

  await this.page.waitForLoadState("networkidle");
  console.log("User login complete");
});

When(
  "the user tries to access {string} directly",
  async function (url: string) {
    await this.page.goto(`http://localhost:8080${url}`);
  },
);

Then("access should be denied with 403 or redirect", async function () {
  const url = this.page.url();
  const content = await this.page.textContent("body");

  const isLoginRedirect = url.includes("/login");
  const hasAccessDeniedText =
    content?.includes("Access Denied") ||
    content?.includes("403") ||
    content?.includes("Forbidden");

  if (isLoginRedirect) {
    console.log("Redirected to login page (Access Denied)");
  } else if (hasAccessDeniedText) {
    console.log("Access Denied message displayed");
  } else {
    console.log(`Current URL: ${url}`);
  }

  expect(isLoginRedirect || hasAccessDeniedText).toBeTruthy();
});

Given("the API base URL is {string}", function (baseUrl: string) {
  this.apiBaseUrl = baseUrl;
  this.apiHelper = new ApiHelper(this.apiRequest, baseUrl);
  this.authHelper = new AuthHelper(this.apiRequest, baseUrl);
  console.log(`API Base URL set to: ${baseUrl}`);
});

Given("admin is authenticated with a valid token", async function () {
  const token = await this.authHelper.loginAdmin();
  this.apiHelper.setAuthToken(token);
  this.userRole = "admin";
});

Given("user is authenticated with a valid token", async function () {
  const token = await this.authHelper.loginUser();
  this.apiHelper.setAuthToken(token);
  this.userRole = "user";
});

function resolveEndpoint(world: any, endpoint: string): string {
  let resolved = endpoint;
  if (world.seededPlantName)
    resolved = resolved.replace("{seededPlantName}", world.seededPlantName);
  if (world.seededCategoryId)
    resolved = resolved.replace(
      "{seededCategoryId}",
      world.seededCategoryId.toString(),
    );
  if (world.seededPlantId)
    resolved = resolved.replace(
      "{seededPlantId}",
      world.seededPlantId.toString(),
    );
  return resolved;
}

When("admin sends GET request to {string}", async function (endpoint: string) {
  const resolved = resolveEndpoint(this, endpoint);
  console.log(`admin → GET ${resolved}`);
  this.apiResponse = await this.apiHelper.get(resolved);
  this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

When("user sends GET request to {string}", async function (endpoint: string) {
  const resolved = resolveEndpoint(this, endpoint);
  console.log(`→ GET ${resolved}`);
  this.apiResponse = await this.apiHelper.get(resolved);
  this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

Then(
  "the response status code should be {int}",
  function (expectedStatus: number) {
    const actualStatus = this.apiResponse.status();
    console.log(
      `→ Verifying status code: Expected ${expectedStatus}, Got ${actualStatus}`,
    );
    expect(actualStatus).toBe(expectedStatus);
  },
);
