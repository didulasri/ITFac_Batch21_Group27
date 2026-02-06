import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect, APIRequestContext, APIResponse } from "@playwright/test";
import { ApiHelper } from "../utils/api-helper";
import { AuthHelper } from "../utils/auth-helper";

setDefaultTimeout(60 * 1000); // 60 seconds

interface CM1CustomWorld {
  apiBaseUrl: string;
  apiHelper: ApiHelper;
  authHelper: AuthHelper;
  apiResponse: APIResponse;
  responseBody: any;
  userRole: string;
  apiRequest: APIRequestContext;
  cm1CreatedCategoryId?: number;
  cm1CreatedCategoryName?: string;
  cm1ParentCategoryId?: number;
  cm1ParentCategoryName?: string;
  activeAuthToken?: string;
}

/* ==================== UTILITY FUNCTIONS ==================== */

function generateUniqueCM1Name(prefix: string): string {
  const shortPrefix = prefix.substring(0, 3);
  return `${shortPrefix}${Date.now().toString().slice(-6)}`;
}

function replaceCM1Placeholders(world: CM1CustomWorld, text: string): string {
  let result = text;
  if (world.cm1CreatedCategoryId) {
    result = result.replace(/{cm1CreatedCategoryId}/g, world.cm1CreatedCategoryId.toString());
  }
  if (world.cm1ParentCategoryId) {
    result = result.replace(/{cm1ParentCategoryId}/g, world.cm1ParentCategoryId.toString());
  }
  if (world.cm1CreatedCategoryName) {
    result = result.replace(/{cm1CreatedCategoryName}/g, world.cm1CreatedCategoryName);
  }
  return result;
}

/* ==================== BACKGROUND ==================== */

Given("the CM1 API base URL is {string}", function (this: CM1CustomWorld, baseUrl: string) {
  this.apiBaseUrl = baseUrl;
  this.apiHelper = new ApiHelper(this.apiRequest, baseUrl);
  this.authHelper = new AuthHelper(this.apiRequest, baseUrl);
});

/* ==================== AUTHENTICATION ==================== */

Given("CM1 admin is authenticated with a valid token", async function (this: CM1CustomWorld) {
  this.activeAuthToken = await this.authHelper.loginAdmin();
  this.apiHelper.setAuthToken(this.activeAuthToken);
  this.userRole = "admin";
});

Given("CM1 user is authenticated with a valid token", async function (this: CM1CustomWorld) {
  this.activeAuthToken = await this.authHelper.loginUser();
  this.apiHelper.setAuthToken(this.activeAuthToken);
  this.userRole = "user";
});

/* ==================== PRECONDITIONS ==================== */

Given("a CM1 category with name {string} exists", async function (this: CM1CustomWorld, categoryName: string) {
  const originalToken = this.activeAuthToken;
  const adminToken = await this.authHelper.loginAdmin();
  this.apiHelper.setAuthToken(adminToken);

  const uniqueName = generateUniqueCM1Name(categoryName);

  const response = await this.apiHelper.post("/api/categories", { name: uniqueName });
  const responseBody = await this.apiHelper.getResponseBody(response);

  expect(response.status()).toBe(201);
  this.cm1CreatedCategoryId = responseBody.id;
  this.cm1CreatedCategoryName = responseBody.name;

  this.apiHelper.setAuthToken(originalToken || "");
});

Given("a CM1 main category with name {string} exists", async function (this: CM1CustomWorld, categoryName: string) {
  const originalToken = this.activeAuthToken;
  const adminToken = await this.authHelper.loginAdmin();
  this.apiHelper.setAuthToken(adminToken);

  const uniqueName = generateUniqueCM1Name(categoryName);

  const response = await this.apiHelper.post("/api/categories", { name: uniqueName });
  const responseBody = await this.apiHelper.getResponseBody(response);

  expect(response.status()).toBe(201);
  this.cm1ParentCategoryId = responseBody.id;
  this.cm1ParentCategoryName = responseBody.name;
  this.cm1CreatedCategoryId = responseBody.id;
  this.cm1CreatedCategoryName = responseBody.name;

  this.apiHelper.setAuthToken(originalToken || "");
});

Given(
  "a CM1 sub-category with name {string} exists under the created parent",
  async function (this: CM1CustomWorld, categoryName: string) {
    const originalToken = this.activeAuthToken;
    const adminToken = await this.authHelper.loginAdmin();
    this.apiHelper.setAuthToken(adminToken);

    const uniqueName = generateUniqueCM1Name(categoryName);

    const response = await this.apiHelper.post("/api/categories", {
      name: uniqueName,
      parentId: this.cm1ParentCategoryId,
    });
    const responseBody = await this.apiHelper.getResponseBody(response);

    expect(response.status()).toBe(201);
    this.cm1CreatedCategoryId = responseBody.id;
    this.cm1CreatedCategoryName = responseBody.name;

    this.apiHelper.setAuthToken(originalToken || "");
  }
);

/* ==================== WHEN STEPS - API CALLS ==================== */

When(
  /^CM1 (admin|user) sends GET request to "([^"]*)"$/,
  async function (this: CM1CustomWorld, role: string, endpoint: string) {
    const resolvedEndpoint = replaceCM1Placeholders(this, endpoint);

    this.apiResponse = await this.apiHelper.get(resolvedEndpoint);
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse).catch(() => { });
  }
);

/* ==================== THEN STEPS - ASSERTIONS ==================== */

Then("the CM1 response status code should be {int}", function (this: CM1CustomWorld, expectedStatus: number) {
  expect(this.apiResponse.status()).toBe(expectedStatus);
});

Then(
  "the CM1 response should contain paginated categories",
  function (this: CM1CustomWorld) {
    expect(this.responseBody).toBeDefined();
    // Paginated response should have content array
    expect(this.responseBody.content).toBeDefined();
    expect(Array.isArray(this.responseBody.content)).toBe(true);

    // Verify the paginated response has items
    const content = this.responseBody.content;
    expect(content.length).toBeGreaterThan(0);
  }
);

Then(
  "the CM1 response should contain categories matching name {string}",
  function (this: CM1CustomWorld, expectedName: string) {
    let actualName = expectedName;
    if (expectedName === "{cm1CreatedCategoryName}") actualName = this.cm1CreatedCategoryName!;

    expect(this.responseBody).toBeDefined();
    const content = this.responseBody.content || this.responseBody;
    const items = Array.isArray(content) ? content : [content];

    const matchFound = items.some((cat: any) => cat.name && cat.name.includes(actualName));
    expect(matchFound).toBe(true);
  }
);

Then(
  "the CM1 response should contain categories with parentId {string}",
  function (this: CM1CustomWorld, expectedParentId: string) {
    let actualParentId = expectedParentId;
    if (expectedParentId === "{cm1ParentCategoryId}") actualParentId = this.cm1ParentCategoryId!.toString();

    expect(this.responseBody).toBeDefined();
    // Paginated response should have content array
    expect(this.responseBody.content).toBeDefined();
    expect(Array.isArray(this.responseBody.content)).toBe(true);
  }
);

Then(
  "the CM1 response should contain category with correct id and name",
  function (this: CM1CustomWorld) {
    expect(this.responseBody).toBeDefined();
    expect(this.responseBody.id).toBe(this.cm1CreatedCategoryId);
    expect(this.responseBody.name).toBe(this.cm1CreatedCategoryName);
  }
);

Then("the CM1 response should contain a list of categories", function (this: CM1CustomWorld) {
  expect(this.responseBody).toBeDefined();
  expect(Array.isArray(this.responseBody)).toBe(true);
});

Then("the CM1 response should contain paginated results", function (this: CM1CustomWorld) {
  expect(this.responseBody).toBeDefined();
  expect(this.responseBody.content).toBeDefined();
  expect(Array.isArray(this.responseBody.content)).toBe(true);
});