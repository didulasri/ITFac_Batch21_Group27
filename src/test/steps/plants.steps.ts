import { Given, When, Then } from "@cucumber/cucumber";
import { PlantPage } from "../pages/PlantPage";



/* ================= OPEN PAGE ================= */

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

/* ================= COMMON ASSERTION ================= */

Then("the list of plants should be displayed", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.verifyPlantsDisplayed();
});

/* ================= SEARCH ================= */

When(
  "the admin searches for plant {string}",
  async function (plantName: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.searchPlant(plantName);
  },
);

When(
  "the user searches for plant {string}",
  async function (plantName: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.searchPlant(plantName);
  },
);

Then(
  "only plants matching {string} should be displayed",
  async function (text: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.verifySearchResultsContain(text);
  },
);

/* ================= FILTER ================= */

When(
  "the admin filters plants by category {string}",
  async function (category: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.filterByCategory(category);
  },
);

When(
  "the user filters plants by category {string}",
  async function (category: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.filterByCategory(category);
  },
);

Then(
  "only plants under category {string} should be displayed",
  async function (category: string) {
    const plantPage = new PlantPage(this.page);
    await plantPage.verifyCategoryResults(category);
  },
);

/* ================= LOW STOCK ================= */

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

/* ================= SORT ================= */

When("the admin sorts plants by name", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.sortByName();
});

Then("plants should be displayed in alphabetical order", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.verifySortedAlphabetically();
});

/* ================= ADMIN CONTROLS ================= */

Then("admin action buttons should be visible", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.verifyAdminControlsVisible();
});

Then("admin-only action controls should not be visible", async function () {
  const plantPage = new PlantPage(this.page);
  await plantPage.verifyAdminControlsHidden();
});
