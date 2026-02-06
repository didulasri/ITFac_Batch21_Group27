
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ApiHelper } from "../utils/api-helper";
import { AuthHelper } from "../utils/auth-helper";

/* ==================== BACKGROUND & CONFIG ==================== */

Given("the API base URL is {string}", function (baseUrl: string) {
    this.apiBaseUrl = baseUrl;
    this.apiHelper = new ApiHelper(this.apiRequest, baseUrl);
    this.authHelper = new AuthHelper(this.apiRequest, baseUrl);
    console.log(`API Base URL set to: ${baseUrl}`);
});

/* ==================== AUTHENTICATION ==================== */

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

/* ==================== GENERIC REQUEST STEPS ==================== */

When("admin sends GET request to {string}", async function (endpoint: string) {
    console.log(`→ GET ${endpoint}`);
    this.apiResponse = await this.apiHelper.get(endpoint);
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

When("user sends GET request to {string}", async function (endpoint: string) {
    console.log(`→ GET ${endpoint}`);
    this.apiResponse = await this.apiHelper.get(endpoint);
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

/* ==================== GENERIC ASSERTION STEPS ==================== */

Then("the response status code should be {int}", function (expectedStatus: number) {
    const actualStatus = this.apiResponse.status();
    console.log(`→ Verifying status code: Expected ${expectedStatus}, Got ${actualStatus}`);
    expect(actualStatus).toBe(expectedStatus);
    console.log(`✓ Status code is ${expectedStatus}`);
});
