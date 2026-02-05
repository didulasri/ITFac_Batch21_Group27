import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect, APIRequestContext, APIResponse } from "@playwright/test";
import { ApiHelper } from "../utils/api-helper";
import { AuthHelper } from "../utils/auth-helper";

setDefaultTimeout(60 * 1000); // 60 seconds

interface CM2CustomWorld {
  apiBaseUrl: string;
  apiHelper: ApiHelper;
  authHelper: AuthHelper;
  apiResponse: APIResponse;
  responseBody: any;
  userRole: string;
  apiRequest: APIRequestContext;
  cm2CreatedCategoryId?: number;
  cm2CreatedCategoryName?: string;
  cm2ParentCategoryId?: number;
  cm2ParentCategoryName?: string;
  activeAuthToken?: string;
  cm2GeneratedCategoryName?: string;
  cm2GeneratedSubCategoryName?: string;
  cm2UpdatedCategoryName?: string;
  cm2GeneratedUserCategoryName?: string;
  cm2UpdatedUserCategoryName?: string;
  cm2GeneratedAnonCategoryName?: string;
  cm2UpdatedAnonCategoryName?: string;
}

/* ==================== UTILITY FUNCTIONS ==================== */

function generateUniqueCM2Name(prefix: string): string {
  const shortPrefix = prefix.substring(0, 3);
  return `${shortPrefix}${Date.now().toString().slice(-6)}`;
}

function replaceCM2Placeholders(world: CM2CustomWorld, text: string): string {
  let result = text;
  if (world.cm2CreatedCategoryId) {
    result = result.replace(/{cm2CreatedCategoryId}/g, world.cm2CreatedCategoryId.toString());
  }
  if (world.cm2ParentCategoryId) {
    result = result.replace(/{cm2ParentCategoryId}/g, world.cm2ParentCategoryId.toString());
  }
  if (world.cm2GeneratedCategoryName) {
    result = result.replace(/{cm2GeneratedCategoryName}/g, world.cm2GeneratedCategoryName);
  }
  if (world.cm2GeneratedSubCategoryName) {
    result = result.replace(/{cm2GeneratedSubCategoryName}/g, world.cm2GeneratedSubCategoryName);
  }
  if (world.cm2UpdatedCategoryName) {
    result = result.replace(/{cm2UpdatedCategoryName}/g, world.cm2UpdatedCategoryName);
  }
  if (world.cm2GeneratedUserCategoryName) {
    result = result.replace(/{cm2GeneratedUserCategoryName}/g, world.cm2GeneratedUserCategoryName);
  }
  if (world.cm2UpdatedUserCategoryName) {
    result = result.replace(/{cm2UpdatedUserCategoryName}/g, world.cm2UpdatedUserCategoryName);
  }
  if (world.cm2GeneratedAnonCategoryName) {
    result = result.replace(/{cm2GeneratedAnonCategoryName}/g, world.cm2GeneratedAnonCategoryName);
  }
  if (world.cm2UpdatedAnonCategoryName) {
    result = result.replace(/{cm2UpdatedAnonCategoryName}/g, world.cm2UpdatedAnonCategoryName);
  }
  return result;
}

/* ==================== BACKGROUND ==================== */

Given("the CM2 API base URL is {string}", function (this: CM2CustomWorld, baseUrl: string) {
  this.apiBaseUrl = baseUrl;
  this.apiHelper = new ApiHelper(this.apiRequest, baseUrl);
  this.authHelper = new AuthHelper(this.apiRequest, baseUrl);
});

/* ==================== AUTHENTICATION ==================== */

Given("CM2 admin is authenticated with a valid token", async function (this: CM2CustomWorld) {
  this.activeAuthToken = await this.authHelper.loginAdmin();
  this.apiHelper.setAuthToken(this.activeAuthToken);
  this.userRole = "admin";
});

Given("CM2 user is authenticated with a valid token", async function (this: CM2CustomWorld) {
  this.activeAuthToken = await this.authHelper.loginUser();
  this.apiHelper.setAuthToken(this.activeAuthToken);
  this.userRole = "user";
});

/* ==================== PRECONDITIONS ==================== */

Given("a CM2 category with name {string} exists", async function (this: CM2CustomWorld, categoryName: string) {
  const originalToken = this.activeAuthToken;
  const adminToken = await this.authHelper.loginAdmin();
  this.apiHelper.setAuthToken(adminToken);

  const uniqueName = generateUniqueCM2Name(categoryName);

  const response = await this.apiHelper.post("/api/categories", { name: uniqueName });
  const responseBody = await this.apiHelper.getResponseBody(response);

  expect(response.status()).toBe(201);
  this.cm2CreatedCategoryId = responseBody.id;
  this.cm2CreatedCategoryName = responseBody.name;

  this.apiHelper.setAuthToken(originalToken || "");
});

Given("a CM2 main category with name {string} exists", async function (this: CM2CustomWorld, categoryName: string) {
  const originalToken = this.activeAuthToken;
  const adminToken = await this.authHelper.loginAdmin();
  this.apiHelper.setAuthToken(adminToken);

  const uniqueName = generateUniqueCM2Name(categoryName);

  const response = await this.apiHelper.post("/api/categories", { name: uniqueName });
  const responseBody = await this.apiHelper.getResponseBody(response);

  expect(response.status()).toBe(201);
  this.cm2ParentCategoryId = responseBody.id;
  this.cm2ParentCategoryName = responseBody.name;
  this.cm2CreatedCategoryId = responseBody.id;
  this.cm2CreatedCategoryName = responseBody.name;

  this.apiHelper.setAuthToken(originalToken || "");
});

/* ==================== WHEN STEPS - API CALLS ==================== */

When(
  /^CM2 (admin|user) sends (POST|PUT|DELETE|GET) request to "([^"]*)"(?: with body (.+))?$/,
  async function (this: CM2CustomWorld, role: string, method: string, endpoint: string, bodyString: string) {
    let currentEndpoint = replaceCM2Placeholders(this, endpoint);

    // Generate unique names based on scenario context
    if (method === "POST" && endpoint === "/api/categories") {
      if (role === "admin") {
        if (!this.cm2GeneratedCategoryName) this.cm2GeneratedCategoryName = generateUniqueCM2Name("Main");
        if (!this.cm2GeneratedSubCategoryName) this.cm2GeneratedSubCategoryName = generateUniqueCM2Name("Sub");
      } else if (role === "user") {
        if (!this.cm2GeneratedUserCategoryName) this.cm2GeneratedUserCategoryName = generateUniqueCM2Name("User");
      }
    } else if (method === "PUT") {
      if (role === "admin") {
        if (!this.cm2UpdatedCategoryName) this.cm2UpdatedCategoryName = generateUniqueCM2Name("New");
      } else if (role === "user") {
        if (!this.cm2UpdatedUserCategoryName) this.cm2UpdatedUserCategoryName = generateUniqueCM2Name("Upd");
      }
    }

    const resolvedBodyString = bodyString ? replaceCM2Placeholders(this, bodyString) : undefined;
    const requestBody = resolvedBodyString ? JSON.parse(resolvedBodyString) : undefined;

    switch (method) {
      case "POST":
        this.apiResponse = await this.apiHelper.post(currentEndpoint, requestBody);
        break;
      case "PUT":
        this.apiResponse = await this.apiHelper.put(currentEndpoint, requestBody);
        break;
      case "DELETE":
        this.apiResponse = await this.apiHelper.delete(currentEndpoint);
        break;
      case "GET":
        this.apiResponse = await this.apiHelper.get(currentEndpoint);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse).catch(() => {});
  }
);

When(
  /^an unauthorized CM2 client sends (POST|PUT|DELETE|GET) request to "([^"]*)"(?: with body (.+))?$/,
  async function (this: CM2CustomWorld, method: string, endpoint: string, bodyString: string) {
    const originalToken = this.activeAuthToken;
    this.apiHelper.setAuthToken("");

    let currentEndpoint = replaceCM2Placeholders(this, endpoint);

    // Generate unique names for unauthorized scenarios
    if (method === "POST" && endpoint === "/api/categories") {
      if (!this.cm2GeneratedAnonCategoryName) this.cm2GeneratedAnonCategoryName = generateUniqueCM2Name("Anon");
    } else if (method === "PUT") {
      if (!this.cm2UpdatedAnonCategoryName) this.cm2UpdatedAnonCategoryName = generateUniqueCM2Name("AnonUpd");
    }

    const resolvedBodyString = bodyString ? replaceCM2Placeholders(this, bodyString) : undefined;
    const requestBody = resolvedBodyString ? JSON.parse(resolvedBodyString) : undefined;

    switch (method) {
      case "POST":
        this.apiResponse = await this.apiHelper.post(currentEndpoint, requestBody);
        break;
      case "PUT":
        this.apiResponse = await this.apiHelper.put(currentEndpoint, requestBody);
        break;
      case "DELETE":
        this.apiResponse = await this.apiHelper.delete(currentEndpoint);
        break;
      case "GET":
        this.apiResponse = await this.apiHelper.get(currentEndpoint);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse).catch(() => {});

    this.apiHelper.setAuthToken(originalToken || "");
  }
);

/* ==================== THEN STEPS - ASSERTIONS ==================== */

Then("the CM2 response status code should be {int}", function (this: CM2CustomWorld, expectedStatus: number) {
  expect(this.apiResponse.status()).toBe(expectedStatus);
});

Then("the CM2 response should contain a category with name {string}", function (this: CM2CustomWorld, expectedName: string) {
  let actualExpectedName = expectedName;
  if (expectedName === "{cm2GeneratedCategoryName}") actualExpectedName = this.cm2GeneratedCategoryName!;
  if (expectedName === "{cm2GeneratedSubCategoryName}") actualExpectedName = this.cm2GeneratedSubCategoryName!;
  if (expectedName === "{cm2UpdatedCategoryName}") actualExpectedName = this.cm2UpdatedCategoryName!;
  if (expectedName === "{cm2GeneratedUserCategoryName}") actualExpectedName = this.cm2GeneratedUserCategoryName!;
  if (expectedName === "{cm2UpdatedUserCategoryName}") actualExpectedName = this.cm2UpdatedUserCategoryName!;
  if (expectedName === "{cm2GeneratedAnonCategoryName}") actualExpectedName = this.cm2GeneratedAnonCategoryName!;
  if (expectedName === "{cm2UpdatedAnonCategoryName}") actualExpectedName = this.cm2UpdatedAnonCategoryName!;

  expect(this.responseBody).toBeDefined();
  expect(this.responseBody.name).toBe(actualExpectedName);
  expect(this.responseBody.id).toBeDefined();
});

Then(
  "the CM2 response should contain a sub-category with name {string}",
  function (this: CM2CustomWorld, expectedName: string) {
    let actualExpectedName = expectedName;
    if (expectedName === "{cm2GeneratedSubCategoryName}") actualExpectedName = this.cm2GeneratedSubCategoryName!;

    expect(this.responseBody).toBeDefined();
    expect(this.responseBody.name).toBe(actualExpectedName);
    expect(this.responseBody.id).toBeDefined();
  }
);

Then("the CM2 response body should contain error message {string}", function (this: CM2CustomWorld, errorMessage: string) {
  expect(this.responseBody).toBeDefined();
  expect(this.responseBody.message).toContain(errorMessage);
});

Then("a CM2 GET request to {string} should return {int}", async function (this: CM2CustomWorld, endpoint: string, expectedStatus: number) {
  const url = replaceCM2Placeholders(this, endpoint);
  const getResponse = await this.apiHelper.get(url);
  expect(getResponse.status()).toBe(expectedStatus);
});