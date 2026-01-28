import { Given, When, Then } from "@cucumber/cucumber";
import { PlantPage } from "../pages/PlantPage";

/* ================= LOGIN STEPS ================= */
Given("the user is logged in as Admin", async function () {
  await this.page.goto("http://localhost:8080/ui/login");

  await this.page.waitForSelector('input[name="username"]', {
    state: "visible",
  });
  await this.page.fill('input[name="username"]', "admin");

  await this.page.fill('input[name="password"]', "admin123");
  await this.page.click('button[type="submit"]');

  // 🔥 VERY IMPORTANT
  await this.page.waitForSelector("text=Plants");

  console.log("✓ Admin login complete");
});

Given("the user is logged in as User", async function () {
  await this.page.goto("http://localhost:8080/ui/login");

  await this.page.waitForSelector('input[name="username"]', {
    state: "visible",
  });
  await this.page.fill('input[name="username"]', "testuser");

  await this.page.fill('input[name="password"]', "test123");
  await this.page.click('button[type="submit"]');

  await this.page.waitForSelector("text=Plants");

  console.log("✓ User login complete");
});

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
