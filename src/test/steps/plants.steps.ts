import { When, Then } from "@cucumber/cucumber";
import { PlantPage } from "../pages/PlantPage";

import { DataSeeder } from "../utils/DataSeeder";

When("standard test plants exist", async function () {
  const requester = this.apiRequest || this.page.request;
  const dataSeeder = new DataSeeder(requester, "http://localhost:8080");

  console.log("Seeding dynamic test data...");

  const cats = await dataSeeder.createCategoryHierarchy();

  const plant = await dataSeeder.createPlant(cats.subCategoryId.toString());

  this.seededData = {
    mainCategoryName: cats.mainCategoryName,
    subCategoryName: cats.subCategoryName,
    plantName: plant.plantName,
    plantId: plant.plantId,
  };

  console.log(
    `Seeded for test: Plant="${plant.plantName}", Category="${cats.mainCategoryName}" -> "${cats.subCategoryName}"`,
  );
});

When("the admin opens the plants page", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.openPlantListing();
});

When("the user opens the plants page", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.openPlantListing();
});

When("admin opens plants page", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.openPlantListing();
});

Then("the list of plants should be displayed", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.verifyPlantsDisplayed();
});

When(
  "the admin searches for plant {string}",
  async function (plantName: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.searchPlant(plantName);
  },
);

When("the admin searches for the seeded plant", async function () {
  const plantName = this.seededData.plantName;
  const plantPage = new PlantPage(this.page);
  await plantPage.searchPlant(plantName);
});

When(
  "the user searches for plant {string}",
  async function (plantName: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.searchPlant(plantName);
  },
);

When("the user searches for the seeded plant", async function () {
  const plantName = this.seededData.plantName;
  const plantPage = new PlantPage(this.page);
  await plantPage.searchPlant(plantName);
});

Then(
  "only plants matching {string} should be displayed",
  async function (text: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.verifySearchResultsContain(text);
  },
);

Then(
  "only plants matching the seeded plant name should be displayed",
  async function () {
    const text = this.seededData.plantName;
    const plantPage = new PlantPage(this.page);
    await plantPage.verifySearchResultsContain(text);
  },
);

When(
  "the admin filters plants by category {string}",
  async function (category: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.filterByCategory(category);
  },
);

When("the admin filters plants by the seeded category", async function () {
  const category = this.seededData.subCategoryName;
  const plantPage = new PlantPage(this.page);

  await plantPage.filterByCategory(category);
});

When(
  "the user filters plants by category {string}",
  async function (category: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.filterByCategory(category);
  },
);

When("the user filters plants by the seeded category", async function () {
  const category = this.seededData.subCategoryName;
  const plantPage = new PlantPage(this.page);
  await plantPage.filterByCategory(category);
});

Then(
  "only plants under category {string} should be displayed",
  async function (category: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.verifyCategoryResults(category);
  },
);

Then(
  "only plants under the seeded category should be displayed",
  async function () {
    const category = this.seededData.subCategoryName;
    const plantPage = new PlantPage(this.page);
    await plantPage.verifyCategoryResults(category);
  },
);

When("the admin views the plant listing", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.openPlantListing();
});

When("the user views the plant listing", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.openPlantListing();
});

Then("low stock plants should be clearly indicated", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.verifyLowStockVisible();
});

When("the admin sorts plants by name", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.sortByName();
});

Then("plants should be displayed in alphabetical order", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.verifySortedAlphabetically();
});

Then("admin action buttons should be visible", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.verifyAdminControlsVisible();
});

Then("admin-only action controls should not be visible", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.verifyAdminControlsHidden();
});
