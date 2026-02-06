import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ApiHelper } from "../utils/api-helper";
import { AuthHelper } from "../utils/auth-helper";

/**
 * Background & Configuration steps
 */
Given("the API base URL is {string}", function (baseUrl: string) {
  this.apiBaseUrl = baseUrl;
  this.apiHelper = new ApiHelper(this.apiRequest, baseUrl);
  this.authHelper = new AuthHelper(this.apiRequest, baseUrl);
  console.log(`API Base URL set to: ${baseUrl}`);
});


/**
 * Authentication steps for different roles
 */
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


/**
 * Data Precondition steps
 */
Given("a plant exists for sale creation", async function () {
  await setupPlantHierarchy(this);
});

Given("a sale exists in the system", async function () {
  if (!this.testPlantId) {
    await setupPlantHierarchy(this);
  }

  const originalToken = this.apiHelper.getAuthToken();
  const adminToken = await this.authHelper.loginAdmin();
  this.apiHelper.setAuthToken(adminToken);

  try {
    const saleResponse = await this.apiHelper.post(
      `/api/sales/plant/${this.testPlantId}?quantity=1`,
      {},
    );
    if (saleResponse.status() !== 201) {
      const error = await this.apiHelper.getResponseBody(saleResponse);
      console.error("❌ Failed to create test sale:", JSON.stringify(error));
      throw new Error(
        `Failed to create test sale. Status: ${saleResponse.status()}`,
      );
    }
    const sale = await this.apiHelper.getResponseBody(saleResponse);
    this.testSaleId = sale.id;
    console.log(`✓ Created test sale with ID: ${this.testSaleId}`);
  } finally {
    if (originalToken) this.apiHelper.setAuthToken(originalToken);
  }
});

Given("at least one sale exists in the system", async function () {
  if (!this.testSaleId) {
    if (!this.testPlantId) {
      await setupPlantHierarchy(this);
    }
    const originalToken = this.apiHelper.getAuthToken();
    const adminToken = await this.authHelper.loginAdmin();
    this.apiHelper.setAuthToken(adminToken);
    try {
      const saleResponse = await this.apiHelper.post(
        `/api/sales/plant/${this.testPlantId}?quantity=1`,
        {},
      );
      if (saleResponse.status() !== 201) {
        throw new Error(
          `Failed to create sale for "at least one" precondition. Status: ${saleResponse.status()}`,
        );
      }
      const sale = await this.apiHelper.getResponseBody(saleResponse);
      this.testSaleId = sale.id;
    } finally {
      if (originalToken) this.apiHelper.setAuthToken(originalToken);
    }
  }
});

Given("multiple sales exist in the system", async function () {
  const originalToken = this.apiHelper.getAuthToken();
  const adminToken = await this.authHelper.loginAdmin();
  this.apiHelper.setAuthToken(adminToken);

  try {
    if (!this.testSubCategoryId) {
      const mainCat = await (
        await this.apiHelper.post("/api/categories", {
          name: `M${Date.now().toString().slice(-6)}`,
        })
      ).json();
      const subCat = await (
        await this.apiHelper.post("/api/categories", {
          name: `S${Date.now().toString().slice(-6)}`,
          parent: { id: mainCat.id },
        })
      ).json();
      this.testSubCategoryId = subCat.id;
    }

    this.testSaleIds = [];
    for (let i = 0; i < 7; i++) {
      const plantBody = {
        name: `P${(Date.now() + i).toString().slice(-6)}`,
        price: 10,
        quantity: 100,
      };
      const plantResponse = await this.apiHelper.post(
        `/api/plants/category/${this.testSubCategoryId}`,
        plantBody,
      );
      if (plantResponse.status() !== 201) continue;

      const plant = await plantResponse.json();
      const saleResponse = await this.apiHelper.post(
        `/api/sales/plant/${plant.id}?quantity=1`,
        {},
      );
      if (saleResponse.status() === 201) {
        const sale = await saleResponse.json();
        this.testSaleIds.push(sale.id);
      }
    }
    console.log(
      `✓ Created ${this.testSaleIds.length} test sales for pagination`,
    );
  } finally {
    if (originalToken) this.apiHelper.setAuthToken(originalToken);
  }
});

/**
 * Utility function to initialize a valid Category -> Sub-category -> Plant hierarchy
 */
async function setupPlantHierarchy(world: any) {
  const originalToken = world.apiHelper.getAuthToken();
  const adminToken = await world.authHelper.loginAdmin();
  world.apiHelper.setAuthToken(adminToken);

  try {
    const mainCatResponse = await world.apiHelper.post("/api/categories", {
      name: `M${Date.now().toString().slice(-6)}`,
    });
    if (mainCatResponse.status() !== 201) {
      const err = await world.apiHelper.getResponseBody(mainCatResponse);
      throw new Error(`Main Category creation failed: ${JSON.stringify(err)}`);
    }
    const mainCat = await world.apiHelper.getResponseBody(mainCatResponse);
    world.testMainCategoryId = mainCat.id;

    const subCatResponse = await world.apiHelper.post("/api/categories", {
      name: `S${Date.now().toString().slice(-6)}`,
      parent: { id: world.testMainCategoryId },
    });
    if (subCatResponse.status() !== 201) {
      const err = await world.apiHelper.getResponseBody(subCatResponse);
      throw new Error(`Sub Category creation failed: ${JSON.stringify(err)}`);
    }
    const subCat = await world.apiHelper.getResponseBody(subCatResponse);
    world.testSubCategoryId = subCat.id;

    const plantResponse = await world.apiHelper.post(
      `/api/plants/category/${world.testSubCategoryId}`,
      {
        name: `P${Date.now().toString().slice(-6)}`,
        price: 25.99,
        quantity: 100,
      },
    );
    if (plantResponse.status() !== 201) {
      const err = await world.apiHelper.getResponseBody(plantResponse);
      throw new Error(`Plant creation failed: ${JSON.stringify(err)}`);
    }
    const plant = await world.apiHelper.getResponseBody(plantResponse);

    if (!plant || !plant.id) {
      console.error(
        "❌ Plant object received but has no ID:",
        JSON.stringify(plant),
      );
      throw new Error("Plant creation returned an object without an ID");
    }

    world.testPlantId = plant.id;
    console.log(`✓ Robust data setup complete. Plant ID: ${world.testPlantId}`);
  } finally {
    if (originalToken) world.apiHelper.setAuthToken(originalToken);
  }
}

/**
 * Action steps for Sales API endpoints
 */
When(
  "admin sends POST request to create sale for the plant with quantity {int}",
  async function (quantity: number) {
    console.log(
      `→ POST /api/sales/plant/${this.testPlantId}?quantity=${quantity}`,
    );
    this.apiResponse = await this.apiHelper.post(
      `/api/sales/plant/${this.testPlantId}?quantity=${quantity}`,
      {},
    );
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
    if (this.apiResponse.status() >= 400) {
      console.log("DEBUG: Response Status:", this.apiResponse.status());
      console.log(
        "DEBUG: Response Body:",
        JSON.stringify(this.responseBody, null, 2),
      );
    }
  },
);

When(
  "admin sends POST request to create sale for plant {int} with quantity {int}",
  async function (plantId: number, quantity: number) {
    console.log(`→ POST /api/sales/plant/${plantId}?quantity=${quantity}`);
    this.apiResponse = await this.apiHelper.post(
      `/api/sales/plant/${plantId}?quantity=${quantity}`,
      {},
    );
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
  },
);

When("admin sends DELETE request to delete the sale", async function () {
  console.log(`→ DELETE /api/sales/${this.testSaleId}`);
  this.apiResponse = await this.apiHelper.delete(
    `/api/sales/${this.testSaleId}`,
  );
  try {
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
  } catch (error) {
    this.responseBody = null;
  }
});

When(
  "admin sends DELETE request to {string}",
  async function (endpoint: string) {
    console.log(`→ DELETE ${endpoint}`);
    this.apiResponse = await this.apiHelper.delete(endpoint);
    try {
      this.responseBody = await this.apiHelper.getResponseBody(
        this.apiResponse,
      );
    } catch (error) {
      this.responseBody = null;
    }
  },
);

When("user sends GET request to get the sale by ID", async function () {
  console.log(`→ GET /api/sales/${this.testSaleId}`);
  this.apiResponse = await this.apiHelper.get(`/api/sales/${this.testSaleId}`);
  this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
  if (this.apiResponse.status() >= 400) {
    console.log("DEBUG: Response Status:", this.apiResponse.status());
    console.log(
      "DEBUG: Response Body:",
      JSON.stringify(this.responseBody, null, 2),
    );
  }
});

When("user sends POST request to create sale for the plant", async function () {
  console.log(`→ POST /api/sales/plant/${this.testPlantId}?quantity=1`);
  this.apiResponse = await this.apiHelper.post(
    `/api/sales/plant/${this.testPlantId}?quantity=1`,
    {},
  );
  this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

When("user sends DELETE request to delete the sale", async function () {
  console.log(`→ DELETE /api/sales/${this.testSaleId}`);
  this.apiResponse = await this.apiHelper.delete(
    `/api/sales/${this.testSaleId}`,
  );
  try {
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
  } catch (error) {
    this.responseBody = null;
  }
});




When("admin sends GET request to {string}", async function (endpoint: string) {
  console.log(`admin → GET ${endpoint}`);
  this.apiResponse = await this.apiHelper.get(endpoint);
  this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

When("user sends GET request to {string}", async function (endpoint: string) {
  console.log(`→ GET ${endpoint}`);
  this.apiResponse = await this.apiHelper.get(endpoint);
  this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
});

/**
 * Assertion steps
 */
Then("the sale should be created successfully", function () {
  console.log("→ Verifying sale creation");
  if (!this.responseBody || !this.responseBody.id) {
    console.error("DEBUG: Sale creation failed check!");
    console.error(
      "DEBUG: Response Body:",
      JSON.stringify(this.responseBody, null, 2),
    );
  }
  expect(this.responseBody).toBeDefined();
  expect(this.responseBody.id).toBeDefined();
  expect(this.responseBody.plantId || this.responseBody.plant).toBeDefined();

  this.createdSaleId = this.responseBody.id;
  console.log(`✓ Sale created successfully with ID: ${this.createdSaleId}`);
});

Then(
  "the response should contain error message {string}",
  function (expectedMessage: string) {
    console.log(`→ Verifying error message: "${expectedMessage}"`);
    expect(this.responseBody).toBeDefined();
    expect(this.responseBody.message || this.responseBody.error).toContain(
      expectedMessage,
    );
    console.log(`✓ Error message verified`);
  },
);

Then("the response should contain all sales", function () {
  console.log("→ Verifying sales list");
  expect(Array.isArray(this.responseBody)).toBeTruthy();
  expect(this.responseBody.length).toBeGreaterThan(0);
  console.log(`✓ Response contains ${this.responseBody.length} sales`);
});

Then("the response should contain the sale details", function () {
  console.log("→ Verifying sale details");
  expect(this.responseBody).toBeDefined();
  expect(this.responseBody.id).toBe(this.testSaleId);
  console.log(`✓ Sale details verified for ID: ${this.testSaleId}`);
});



Then(
  "the response should contain paginated sales with {int} items per page",
  function (pageSize: number) {
    console.log(`→ Verifying paginated response with page size ${pageSize}`);
    expect(this.responseBody).toBeDefined();

    if (this.responseBody.content) {
      expect(Array.isArray(this.responseBody.content)).toBeTruthy();
      expect(this.responseBody.content.length).toBeLessThanOrEqual(pageSize);
      expect(this.responseBody.size).toBe(pageSize);
      console.log(
        `✓ Paginated response verified: ${this.responseBody.content.length} items on page, size=${pageSize}`,
      );
    } else {
      expect(Array.isArray(this.responseBody)).toBeTruthy();
      expect(this.responseBody.length).toBeLessThanOrEqual(pageSize);
      console.log(
        `✓ Paginated response verified: ${this.responseBody.length} items`,
      );
    }
  },
);

Then(
  "the response status code should be {int}",
  function (expectedStatus: number) {
    const actualStatus = this.apiResponse.status();
    console.log(
      `→ Verifying status code: Expected ${expectedStatus}, Got ${actualStatus}`,
    );
    expect(actualStatus).toBe(expectedStatus);
    console.log(`✓ Status code is ${expectedStatus}`);
  },
);
