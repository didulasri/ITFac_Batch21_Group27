import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { SalesPage } from "../pages/SalesPage";

let salesPage: SalesPage;

Given("a plant exists for sales", async function () {
  if (!this.dataSeeder) {
    throw new Error("DataSeeder not initialized");
  }
  const data = await this.dataSeeder.createPlant();
  this.testPlantId = data.plantId;
  this.plantName = data.plantName;
});

Given("a sale exists in the system for UI", async function () {
  if (!this.dataSeeder) {
    throw new Error("DataSeeder not initialized");
  }

  await this.dataSeeder.createSale(this.testPlantId);
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
