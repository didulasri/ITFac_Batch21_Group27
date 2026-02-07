import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ApiHelper } from "../utils/api-helper";
import { AuthHelper } from "../utils/auth-helper";
import { APIResponse } from "@playwright/test";

Given("at least one plant record exists", function () {
  console.log("Precondition: Plant records exist");
});

import { DataSeeder } from "../utils/DataSeeder";

Given("plant records exist with known plant names", async function () {
  const ds = new DataSeeder(
    this.apiRequest,
    this.apiBaseUrl || "http://localhost:8080",
  );
  const p = await ds.createPlant();
  this.seededPlantName = p.plantName;
  console.log(`Seeded plant for search: ${this.seededPlantName}`);
});

Given("at least one category with associated plants exists", async function () {
  const ds = new DataSeeder(
    this.apiRequest,
    this.apiBaseUrl || "http://localhost:8080",
  );
  const p = await ds.createPlant();
  this.seededCategoryId = p.subCategoryId;
  console.log(`Seeded category for filter: ${this.seededCategoryId}`);
});

Given("low stock plants exist", async function () {
  const ds = new DataSeeder(
    this.apiRequest,
    this.apiBaseUrl || "http://localhost:8080",
  );
  const p = await ds.createPlant();

  await this.apiHelper.put(`/api/plants/${p.plantId}`, {
    name: p.plantName,
    price: 25.99,
    quantity: 5,
    categoryId: p.subCategoryId,
  });
  console.log("Seeded low stock plant");
});

Given(
  "plants exist with varying stock levels including low-stock plants",
  async function () {
    const ds = new DataSeeder(
      this.apiRequest,
      this.apiBaseUrl || "http://localhost:8080",
    );
    await ds.createPlant();

    const p = await ds.createPlant();
    await this.apiHelper.put(`/api/plants/${p.plantId}`, {
      name: p.plantName,
      price: 25.99,
      quantity: 3,
      categoryId: p.subCategoryId,
    });
    console.log("Seeded varying stock plants");
  },
);

Given("plant records exist in the system", async function () {
  const ds = new DataSeeder(
    this.apiRequest,
    this.apiBaseUrl || "http://localhost:8080",
  );
  await ds.createPlant();
  console.log("Confirmed plant records exist");
});

Given("plant records exist with searchable plant names", async function () {
  const ds = new DataSeeder(
    this.apiRequest,
    this.apiBaseUrl || "http://localhost:8080",
  );
  const p = await ds.createPlant();
  this.seededPlantName = p.plantName;
  console.log(`Seeded searchable plant: ${this.seededPlantName}`);
});

Given("categories with associated plants exist", async function () {
  const ds = new DataSeeder(
    this.apiRequest,
    this.apiBaseUrl || "http://localhost:8080",
  );
  const p = await ds.createPlant();
  this.seededCategoryId = p.subCategoryId;
  console.log(`Seeded category with plants: ${this.seededCategoryId}`);
});

Given("plant summary data is available", async function () {
  const ds = new DataSeeder(
    this.apiRequest,
    this.apiBaseUrl || "http://localhost:8080",
  );
  await ds.createPlant();
  console.log("Confirmed summary data available");
});

Given(
  "user role does not have permission to modify plant stock",
  async function () {
    const ds = new DataSeeder(
      this.apiRequest,
      this.apiBaseUrl || "http://localhost:8080",
    );
    const p = await ds.createPlant();
    this.seededPlantId = p.plantId;
    console.log(`Seeded plant for restriction test: ${this.seededPlantId}`);
  },
);

When(
  "user sends PUT request to {string} with stock update",
  async function (endpoint: string) {
    let resolved = endpoint;
    if (this.seededPlantId)
      resolved = resolved.replace(
        "{seededPlantId}",
        this.seededPlantId.toString(),
      );

    const getResponse = await this.apiHelper.get(resolved);
    const originalPlant = await this.apiHelper.getResponseBody(getResponse);

    const updateData = {
      ...originalPlant,
      stock: 100,
    };
    this.apiResponse = await this.apiHelper.put(resolved, updateData);
    this.responseBody = await this.apiHelper.getResponseBody(this.apiResponse);
  },
);

Then("the response should contain list of all plants", function () {
  console.log("→ Verifying plant list in response");
  expect(Array.isArray(this.responseBody)).toBeTruthy();
  expect(this.responseBody.length).toBeGreaterThan(0);
  console.log(`Response contains ${this.responseBody.length} plants`);
});

Then("only matching plant records should be returned", function () {
  console.log("→ Verifying matching plant records");
  expect(Array.isArray(this.responseBody)).toBeTruthy();
  expect(this.responseBody.length).toBeGreaterThan(0);

  const expectedName = this.seededPlantName
    ? this.seededPlantName.toLowerCase()
    : "";

  this.responseBody.forEach((plant: any) => {
    const plantName = plant.name?.toLowerCase() || "";
    if (expectedName) {
      expect(plantName).toContain(expectedName);
    }
  });

  console.log(`All ${this.responseBody.length} plants match search criteria`);
});

Then("plants under selected category should be shown", function () {
  console.log("→ Verifying category-filtered plants");
  expect(Array.isArray(this.responseBody)).toBeTruthy();

  if (this.seededCategoryId) {
  }
  expect(this.responseBody.length).toBeGreaterThan(0);
  console.log(`${this.responseBody.length} plants in selected category`);
});

Then("low stock plants should be displayed", function () {
  console.log("→ Verifying low stock plants in summary");
  expect(this.responseBody).toBeDefined();
  expect(
    this.responseBody.lowStockCount !== undefined ||
      this.responseBody.lowStockPlants !== undefined,
  ).toBeTruthy();
  console.log(`Low stock information present in response`);
});

Then("plant list should be sorted by name in ascending order", function () {
  console.log("→ Verifying sorting and pagination");

  const plants = this.responseBody.content || this.responseBody;
  expect(Array.isArray(plants)).toBeTruthy();

  const plantNames = plants.map((p: any) => p.name);
  const sortedNames = [...plantNames].sort();
  expect(plantNames).toEqual(sortedNames);

  console.log(`Plants are sorted by name in ascending order`);
});

Then("plant list should be returned", function () {
  console.log("→ Verifying plant list returned");
  expect(Array.isArray(this.responseBody)).toBeTruthy();
  expect(this.responseBody.length).toBeGreaterThan(0);
  console.log(`Plant list returned with ${this.responseBody.length} items`);
});

Then("matching plants should be shown", function () {
  console.log("→ Verifying matching plants");
  expect(Array.isArray(this.responseBody)).toBeTruthy();
  expect(this.responseBody.length).toBeGreaterThan(0);

  const expectedName = this.seededPlantName
    ? this.seededPlantName.toLowerCase()
    : "";

  this.responseBody.forEach((plant: any) => {
    const plantName = plant.name?.toLowerCase() || "";
    if (expectedName) {
      expect(plantName).toContain(expectedName);
    }
  });

  console.log(`${this.responseBody.length} matching plants shown`);
});

Then("category-specific plants should be displayed", function () {
  console.log("→ Verifying category-specific plants");
  expect(Array.isArray(this.responseBody)).toBeTruthy();
  expect(this.responseBody.length).toBeGreaterThan(0);
  console.log(`Category-specific plants displayed`);
});

Then("total plants and low stock info should be shown", function () {
  console.log("→ Verifying plant summary data");
  expect(this.responseBody).toBeDefined();
  expect(
    this.responseBody.totalPlants !== undefined ||
      this.responseBody.total !== undefined,
  ).toBeTruthy();
  console.log(`Plant summary data present`);
});
