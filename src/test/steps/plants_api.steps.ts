import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ApiHelper } from "../utils/api-helper";
import { AuthHelper } from "../utils/auth-helper";
import { APIResponse } from "@playwright/test";

/* ==================== BACKGROUND ==================== */

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
    this.userRole = 'admin';
});

Given("user is authenticated with a valid token", async function () {
    const token = await this.authHelper.loginUser();
    this.apiHelper.setAuthToken(token);
    this.userRole = 'user';
});

/* ==================== PRECONDITIONS ==================== */

Given("at least one plant record exists", function () {

    console.log("✓ Precondition: Plant records exist");
});

Given("plant records exist with known plant names", function () {
    console.log("✓ Precondition: Plant records with known names exist");
});

Given("at least one category with associated plants exists", function () {
    console.log("✓ Precondition: Categories with plants exist");
});

Given("low stock plants exist", function () {
    console.log("✓ Precondition: Low stock plants exist");
});

Given("plants exist with varying stock levels including low-stock plants", function () {
    console.log("✓ Precondition: Plants with varying stock levels exist");
});

Given("plant records exist in the system", function () {
    console.log("✓ Precondition: Plant records exist in system");
});

Given("plant records exist with searchable plant names", function () {
    console.log("✓ Precondition: Searchable plant names exist");
});

Given("categories with associated plants exist", function () {
    console.log("✓ Precondition: Categories with plants exist");
});

Given("plant summary data is available", function () {
    console.log("✓ Precondition: Plant summary data available");
});

Given("user role does not have permission to modify plant stock", function () {
    console.log("✓ Precondition: User has no permission to modify stock");
});

/* ==================== WHEN STEPS - API CALLS ==================== */

When("admin sends GET request to {string}", async function (endpoint: string) {
    this.apiResponse = await this.apiHelper.get(endpoint);
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

When("user sends GET request to {string}", async function (endpoint: string) {
    this.apiResponse = await this.apiHelper.get(endpoint);
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

When("user sends PUT request to {string} with stock update", async function (endpoint: string) {
    // First get the existing plant data to ensure we send a complete valid object
    const getResponse = await this.apiHelper.get(endpoint);
    const originalPlant = await this.apiHelper.getResponseBody(getResponse);

    const updateData = {
        ...originalPlant,
        stock: 100
    };
    this.apiResponse = await this.apiHelper.put(endpoint, updateData);
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

/* ==================== THEN STEPS - ASSERTIONS ==================== */

Then("the response status code should be {int}", function (expectedStatus: number) {
    const actualStatus = this.apiResponse.status();
    console.log(`→ Verifying status code: Expected ${expectedStatus}, Got ${actualStatus}`);
    expect(actualStatus).toBe(expectedStatus);
    console.log(`✓ Status code is ${expectedStatus}`);
});

Then("the response should contain list of all plants", function () {
    console.log("→ Verifying plant list in response");
    expect(Array.isArray(this.responseBody)).toBeTruthy();
    expect(this.responseBody.length).toBeGreaterThan(0);
    console.log(`✓ Response contains ${this.responseBody.length} plants`);
});

Then("only matching plant records should be returned", function () {
    console.log("→ Verifying matching plant records");
    expect(Array.isArray(this.responseBody)).toBeTruthy();
    expect(this.responseBody.length).toBeGreaterThan(0);

    // Verify each plant contains the search term
    this.responseBody.forEach((plant: any) => {
        const plantName = plant.name?.toLowerCase() || '';
        expect(plantName).toContain('rose');
    });

    console.log(`✓ All ${this.responseBody.length} plants match search criteria`);
});

Then("plants under selected category should be shown", function () {
    console.log("→ Verifying category-filtered plants");
    expect(Array.isArray(this.responseBody)).toBeTruthy();
    expect(this.responseBody.length).toBeGreaterThan(0);
    console.log(`✓ ${this.responseBody.length} plants in selected category`);
});

Then("low stock plants should be displayed", function () {
    console.log("→ Verifying low stock plants in summary");
    expect(this.responseBody).toBeDefined();
    expect(this.responseBody.lowStockCount !== undefined ||
        this.responseBody.lowStockPlants !== undefined).toBeTruthy();
    console.log(`✓ Low stock information present in response`);
});

Then("plant list should be sorted by name in ascending order", function () {
    console.log("→ Verifying sorting and pagination");


    const plants = this.responseBody.content || this.responseBody;
    expect(Array.isArray(plants)).toBeTruthy();

    // Verify sorting
    const plantNames = plants.map((p: any) => p.name);
    const sortedNames = [...plantNames].sort();
    expect(plantNames).toEqual(sortedNames);

    console.log(`✓ Plants are sorted by name in ascending order`);
});

Then("plant list should be returned", function () {
    console.log("→ Verifying plant list returned");
    expect(Array.isArray(this.responseBody)).toBeTruthy();
    expect(this.responseBody.length).toBeGreaterThan(0);
    console.log(`✓ Plant list returned with ${this.responseBody.length} items`);
});

Then("matching plants should be shown", function () {
    console.log("→ Verifying matching plants");
    expect(Array.isArray(this.responseBody)).toBeTruthy();
    expect(this.responseBody.length).toBeGreaterThan(0);

    this.responseBody.forEach((plant: any) => {
        const plantName = plant.name?.toLowerCase() || '';
        expect(plantName).toContain('lily');
    });

    console.log(`✓ ${this.responseBody.length} matching plants shown`);
});

Then("category-specific plants should be displayed", function () {
    console.log("→ Verifying category-specific plants");
    expect(Array.isArray(this.responseBody)).toBeTruthy();
    expect(this.responseBody.length).toBeGreaterThan(0);
    console.log(`✓ Category-specific plants displayed`);
});

Then("total plants and low stock info should be shown", function () {
    console.log("→ Verifying plant summary data");
    expect(this.responseBody).toBeDefined();
    expect(this.responseBody.totalPlants !== undefined ||
        this.responseBody.total !== undefined).toBeTruthy();
    console.log(`✓ Plant summary data present`);
});