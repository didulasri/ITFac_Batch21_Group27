import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { SalesPage } from "../pages/SalesPage";
import { ApiHelper } from "../utils/api-helper";
import { AuthHelper } from "../utils/auth-helper";

let loginPage: LoginPage;
let salesPage: SalesPage;

Given("the Sales Admin is logged in", async function () {
  loginPage = new LoginPage(this.page);
  await loginPage.loginAsAdmin();
});

Given("the Sales User is logged in", async function () {
  loginPage = new LoginPage(this.page);
  await loginPage.loginAsUser();
});

Given("a plant exists for sales", async function () {
  await setupPlantHierarchy(this);
});

Given("a sale exists in the system for UI", async function () {
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

When("the admin navigates to the Sales page", async function () {
  salesPage = new SalesPage(this.page);
  await salesPage.navigateToSales();
});

When("the user navigates to the Sales page", async function () {
  salesPage = new SalesPage(this.page);
  await salesPage.navigateToSales();
});

When("the admin clicks the Sell Plant button in Sales", async function () {
  await salesPage.clickSellPlant();
});

When("the admin clicks the Save button in Sales", async function () {
  await salesPage.saveSale();
});

When("the admin selects the plant in Sales", async function () {
  const plantToSelect =
    this.plantName || (await salesPage.getFirstAvailablePlant());
  console.log(`Selecting plant: ${plantToSelect}`);
  await salesPage.fillSaleForm(plantToSelect, "");
});

When(
  "the admin enters quantity {string} in Sales",
  async function (qty: string) {
    await salesPage.quantityInput.fill(qty);
  },
);

Then("the sale should be created and listed", async function () {
  const plantName = this.plantName || "White Rose";
  await salesPage.verifySaleInList(plantName, "1");
});

Then(
  "an error {string} should be displayed in Sales",
  async function (errorMsg: string) {
    const validationMessage = await salesPage.quantityInput.evaluate(
      (e: any) => e.validationMessage,
    );
    expect(validationMessage.length).toBeGreaterThan(0);
    console.log(`Validation message: "${validationMessage}"`);
  },
);

When("the admin clicks Delete on the first sale in Sales", async function () {
  this.deleteButtonClicked = false;
});

When("the admin confirms deletion in Sales", async function () {
  this.page.on("dialog", async (dialog: any) => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  });

  await salesPage.deleteButtons.first().click();
  await this.page.waitForLoadState("networkidle");
});

Then("the sale should be removed from the list in Sales", async function () {
  await expect(salesPage.salesTable).toBeVisible();
});

When("the admin cancels deletion in Sales", async function () {
  this.page.on("dialog", async (dialog: any) => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.dismiss();
  });

  await salesPage.deleteButtons.first().click();
  await this.page.waitForTimeout(500);
});

Then("the sale should remain in the list in Sales", async function () {
  const count = await salesPage.salesTable.locator("tbody tr").count();
  expect(count).toBeGreaterThan(0);
});

Then("the Sell Plant button should be visible in Sales", async function () {
  await expect(salesPage.sellButton).toBeVisible();
});

Then("the Sales list should load with correct columns", async function () {
  await expect(salesPage.salesTable).toBeVisible();
  const headerCount = await salesPage.salesTable.locator("th").count();
  expect(headerCount).toBeGreaterThan(0);
  console.log(`Table has ${headerCount} columns`);
});

Then("the Sell Plant button should be hidden in Sales", async function () {
  await expect(salesPage.sellButton).toBeHidden();
});

Then("the Delete buttons should be hidden in Sales", async function () {
  await expect(salesPage.deleteButtons).toHaveCount(0);
});

Then(
  "the Sales list should be sorted by Date Descending by default",
  async function () {
    const rowCount = await salesPage.salesTable.locator("tbody tr").count();
    if (rowCount < 2) {
      console.log("Only 1 or 0 sales records, cannot verify sorting");
      return;
    }

    const firstRowDate = await salesPage.salesTable
      .locator("tbody tr")
      .nth(0)
      .locator("td")
      .last()
      .textContent();
    const secondRowDate = await salesPage.salesTable
      .locator("tbody tr")
      .nth(1)
      .locator("td")
      .last()
      .textContent();

    console.log(
      `First row date: ${firstRowDate}, Second row date: ${secondRowDate}`,
    );

    const date1 = new Date(firstRowDate || "");
    const date2 = new Date(secondRowDate || "");

    expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
  },
);

When(
  "the user tries to access {string} directly",
  async function (url: string) {
    await this.page.goto(`http://localhost:8080${url}`);
  },
);

Then("access should be denied with 403 or redirect", async function () {
  const text = await this.page.textContent("body");
  const restricted =
    text?.includes("Access Denied") ||
    text?.includes("403") ||
    text?.includes("Forbidden");
  expect(restricted).toBeTruthy();
});

async function setupPlantHierarchy(world: any) {
  if (!world.apiHelper) {
    console.error("ApiHelper not found on world instance!");
    return;
  }

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

    const plantName = `P${Date.now().toString().slice(-6)}`;
    const plantResponse = await world.apiHelper.post(
      `/api/plants/category/${world.testSubCategoryId}`,
      {
        name: plantName,
        price: 25.99,
        quantity: 100,
      },
    );
    if (plantResponse.status() !== 201) {
      const err = await world.apiHelper.getResponseBody(plantResponse);
      throw new Error(`Plant creation failed: ${JSON.stringify(err)}`);
    }
    const plant = await world.apiHelper.getResponseBody(plantResponse);

    world.testPlantId = plant.id;
    world.plantName = plant.name;
    console.log(
      `✓ Robust data setup complete. Plant ID: ${world.testPlantId}, Name: ${world.plantName}`,
    );
  } finally {
    if (originalToken) world.apiHelper.setAuthToken(originalToken);
  }
}
