import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CategoryPage } from "../pages/CategoryPage";

let categoryPage: CategoryPage;

// store created name per scenario
let createdCategoryName = "";

// ---------- LOGIN ----------
// ---------- LOGIN ----------
// Login steps are now in common.steps.ts

// ---------- NAVIGATION ----------
// Navigation steps are shared with categories_cm1.steps.ts

// ---------- CM2 UI 01 ----------
When("the admin clicks Add Category", async function () {
  categoryPage = new CategoryPage(this.page);
  await categoryPage.clickAddCategory();
});

Then("the Add Category page should be opened", async function () {
  await categoryPage.verifyAddPageOpened();
});

// ---------- CM2 UI 02 ----------
When(
  /^the admin creates a main category with name "([^"]*)"$/,
  async function (baseName: string) {
    categoryPage = new CategoryPage(this.page);
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
    categoryPage = new CategoryPage(this.page);
    // Use dynamic name with prefix and truncated timestamp for length constraint
    createdCategoryName = `Sub${Date.now().toString().slice(-4)}`;

    await categoryPage.fillCategoryName(createdCategoryName);
    await categoryPage.selectParentByLabel(parentLabel);
    await categoryPage.clickSave();
  }
);

// ---------- CM2 UI 04 ----------
When("the admin tries to save category with empty name", async function () {
  categoryPage = new CategoryPage(this.page);
  await categoryPage.fillCategoryName("");
  await categoryPage.clickSave();
});

Then("the Category Name required validation should be shown", async function () {
  await categoryPage.verifyNameRequiredError();
});

// ---------- CM2 UI 05 ----------
When("the admin enters an invalid name length and tries to save", async function () {
  categoryPage = new CategoryPage(this.page);
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
  categoryPage = new CategoryPage(this.page);
  await categoryPage.clickCancel();
});

Then("the user should be redirected back to categories page", async function () {
  await categoryPage.verifyOnCategoriesList();
});

// ---------- CM2 UI 06 ----------
Then("Add Category button should be hidden for user", async function () {
  categoryPage = new CategoryPage(this.page);
  await categoryPage.verifyAddHiddenForUser();
});

// ---------- CM2 UI 07 ----------
Then("Edit and Delete actions should be hidden or disabled for user", async function () {
  categoryPage = new CategoryPage(this.page);
  await categoryPage.verifyUserEditDeleteHiddenOrDisabled();
});

// ---------- CM2 UI 08 ----------
// ---------- CM2 UI 08 ----------
// Shared with categories_cm1.steps.ts

// ---------- CM2 UI 09 ----------
// Shared with categories_cm1.steps.ts

// shared (expected) assertion: denied
// Shared with categories_cm1.steps.ts

// ---------- CM2 UI 10 ----------
When("the user attempts to delete a category by request", async function () {
  categoryPage = new CategoryPage(this.page);
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