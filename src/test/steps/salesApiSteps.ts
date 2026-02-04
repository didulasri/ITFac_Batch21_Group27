import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ApiUtils } from "../utils/apiUtils";

let response: any;
let createdSaleId: string;

When("I send a POST request to {string}", async function (endpoint) {
  const api = new ApiUtils(this.page.request);
  response = await api.post(endpoint);

  // Attempt to capture ID if successful creation
  if (response.status() === 201) {
    const body = await response.json();
    // Assuming body contains id or we can fetch it.
    // If body is just the object:
    if (body.id) createdSaleId = body.id;
  }
});

When("I send a GET request to {string}", async function (endpoint) {
  const api = new ApiUtils(this.page.request);
  response = await api.get(endpoint);
});

When("I send a DELETE request to {string}", async function (endpoint) {
  const api = new ApiUtils(this.page.request);
  response = await api.delete(endpoint);
});

Then("the response status should be {int}", async function (statusCode) {
  expect(response.status()).toBe(statusCode);
});

Given("a sale exists for plant {string}", async function (plantId) {
  // Helper to create a sale so we can delete it
  // Ensure we have a valid plant ID. If "1" is passed, we might need real ID.
  // For robustness, let's create a plant and use its ID if input is generic.
  // But if the feature file hardcodes "1", we might fail if ID 1 doesn't exist.
  // ideally feature file should use name, but existing step uses ID logic.
  // Let's assume we create a plant "TestPlant" and use that ID if input is "1".

  // Actually, better: Create a plant, get its ID, use THAT ID.
  // But the step signature takes {string}.
  let targetPlantId = plantId;
  if (plantId === "1") {
    targetPlantId = await ApiUtils.createPlant("TestPlantAPI_Del", 50, 100);
  }

  const api = new ApiUtils(this.page.request);
  // Log in user/admin? This step usually assumes Admin context or uses one?
  // Wait, apiUtils default doesn't login.
  // We need to login if we use page.request and page isn't logged in.
  // But this is "Given", maybe before login?
  // "Given I login as..." is usually before this.
  // If we are logged in as Admin in the test, we can post.

  const res = await api.post(`/api/sales/plant/${targetPlantId}?quantity=1`);
  expect(res.status()).toBe(201);
  const body = await res.json();
  createdSaleId = body.id; // Store ID for next steps
});

Given("a sale exists for {string} via API", async function (purpose) {
  // Generic setup if needed
  // reusing the above logic or relying on seed
  if (purpose === "Validation") {
    // Ensure plant exists
    const pid = await ApiUtils.createPlant("ValidationPlant", 100, 10);

    const api = new ApiUtils(this.page.request);
    const res = await api.post(`/api/sales/plant/${pid}?quantity=1`);
    if (res.status() === 201) {
      const body = await res.json();
      createdSaleId = body.id;
    }
  }
});

When(
  "I send a POST request to create a sale for plant {string}",
  async function (plantName) {
    const pid = await ApiUtils.getPlantIdByName(plantName);
    expect(pid).toBeTruthy(); // Ensure plant exists

    const api = new ApiUtils(this.page.request);
    response = await api.post(`/api/sales/plant/${pid}?quantity=1`);
  },
);

When("I send a DELETE request to the sale endpoint", async function () {
  const api = new ApiUtils(this.page.request);
  response = await api.delete(`/api/sales/${createdSaleId}`);
});

When("I send a GET request to the sale endpoint", async function () {
  const api = new ApiUtils(this.page.request);
  response = await api.get(`/api/sales/${createdSaleId}`);
});
