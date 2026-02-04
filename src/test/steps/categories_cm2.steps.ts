import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CategoryPage } from "../pages/CategoryPage";

let categoryPage: CategoryPage;

// store created name per scenario
let createdCategoryName = "";

// ---------- LOGIN ----------
Given("the user is logged in as Admin", async function () {
  await this.page.goto("http://localhost:8080/ui/login");

  await this.page.waitForSelector('input[name="username"]', { state: "visible" });
  await this.page.fill('input[name="username"]', "admin");
  await this.page.fill('input[name="password"]', "admin123");
  await this.page.click('button[type="submit"]');

  await this.page.waitForSelector("text=Categories");
  categoryPage = new CategoryPage(this.page);

  console.log("✓ Admin login complete");
});

Given("the user is logged in as User", async function () {
  await this.page.goto("http://localhost:8080/ui/login");

  await this.page.waitForSelector('input[name="username"]', { state: "visible" });
  await this.page.fill('input[name="username"]', "testuser");
  await this.page.fill('input[name="password"]', "test123");
  await this.page.click('button[type="submit"]');

  await this.page.waitForLoadState("networkidle"); // Wait for navigation to complete
  await this.page.waitForSelector("text=Categories");
  categoryPage = new CategoryPage(this.page);

  console.log("✓ User login complete");
});

// ---------- NAVIGATION ----------
When("the admin opens the categories page", async function () {
  await categoryPage.openCategoryListing();
});

When("the user opens the categories page", async function () {
  await categoryPage.openCategoryListing();
});

// ---------- CM2 UI 01 ----------
When("the admin clicks Add Category", async function () {
  await categoryPage.clickAddCategory();
});

Then("the Add Category page should be opened", async function () {
  await categoryPage.verifyAddPageOpened();
});

// ---------- CM2 UI 02 ----------
When(
  /^the admin creates a main category with name "([^"]*)"$/,
  async function (baseName: string) {
    // Use dynamic name with prefix and truncated timestamp for length constraint
    createdCategoryName = `Cat${Date.now().toString().slice(-4)}`;

    await categoryPage.fillCategoryName(createdCategoryName);
    await categoryPage.selectParentEmpty();
    await categoryPage.clickSave();
  }
);

Then("the categories page should show the created category", async function () {
  await categoryPage.verifyOnCategoriesList();
  await categoryPage.searchCategory(createdCategoryName);
  await categoryPage.verifyListContains(createdCategoryName);
});

// ---------- CM2 UI 03 ----------
When(
  /^the admin creates a sub category with name "([^"]*)" under parent "([^"]*)"$/,
  async function (baseName: string, parentLabel: string) {
    // Use dynamic name with prefix and truncated timestamp for length constraint
    createdCategoryName = `Sub${Date.now().toString().slice(-4)}`;

    await categoryPage.fillCategoryName(createdCategoryName);
    await categoryPage.selectParentByLabel(parentLabel);
    await categoryPage.clickSave();
  }
);

// ---------- CM2 UI 04 ----------
When("the admin tries to save category with empty name", async function () {
  await categoryPage.fillCategoryName("");
  await categoryPage.clickSave();
});

Then("the Category Name required validation should be shown", async function () {
  await categoryPage.verifyNameRequiredError();
});

// ---------- CM2 UI 05 ----------
When("the admin enters an invalid name length and tries to save", async function () {
  // too short
  await categoryPage.fillCategoryName("AA");
  await categoryPage.clickSave();
  await categoryPage.verifyNameLengthError();

  // too long
  await categoryPage.fillCategoryName("ABCDEFGHIJK"); // 11 chars
  await categoryPage.clickSave();
  await categoryPage.verifyNameLengthError();
});

Then("the Category Name length validation should be shown", async function () {
  await categoryPage.verifyNameLengthError();
});

When(/^the admin clicks Cancel on add\/edit page$/, async function () {
  await categoryPage.clickCancel();
});

Then("the user should be redirected back to categories page", async function () {
  await categoryPage.verifyOnCategoriesList();
});

// ---------- CM2 UI 06 ----------
Then("Add Category button should be hidden for user", async function () {
  await categoryPage.verifyAddHiddenForUser();
});

// ---------- CM2 UI 07 ----------
Then("Edit and Delete actions should be hidden or disabled for user", async function () {
  await categoryPage.verifyUserEditDeleteHiddenOrDisabled();
});

// ---------- CM2 UI 08 ----------
When("the user tries to open the add category page", async function () {
  await categoryPage.openAddCategoryDirect();
});

// ---------- CM2 UI 09 ----------
When("the user tries to open the edit category page for an existing category", async function () {
  const id = await categoryPage.getFirstCategoryIdFromListOrFallback();
  await categoryPage.openEditCategoryDirect(id);
});

// shared (expected) assertion: denied
Then("access should be denied", async function () {
  await categoryPage.verifyAccessDenied();
});

// ---------- CM2 UI 10 ----------
When("the user attempts to delete a category by request", async function () {
  // Get any id to attempt delete
  const id = await categoryPage.getFirstCategoryIdFromListOrFallback();
  const status = await categoryPage.attemptDeleteViaFetch(id);
  (this as any).lastDeleteStatus = status;
});

Then("the delete request should be forbidden or blocked", async function () {
  const status = (this as any).lastDeleteStatus;

  // Depending on how app behaves, it can return 401/403/404 or redirect.
  // For a "blocked" expectation, accept 401/403.
  expect([401, 403]).toContain(status);
});
