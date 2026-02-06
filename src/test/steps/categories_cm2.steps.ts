import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CategoryPage } from "../pages/CategoryPage";

// Lazy-init: shared login steps (in categories_cm1.steps.ts) don't set this module's
// categoryPage, so we create it on first use from the World's page object.
let categoryPage: CategoryPage;

function cp(world: any): CategoryPage {
  if (!categoryPage || categoryPage["page"] !== world.page) {
    categoryPage = new CategoryPage(world.page);
  }
  return categoryPage;
}

// store created name per scenario
let createdCategoryName = "";

// ---------- CM2 UI 01 ----------
When("the admin clicks Add Category", async function () {
  await cp(this).clickAddCategory();
});

Then("the Add Category page should be opened", async function () {
  await cp(this).verifyAddPageOpened();
});

// ---------- CM2 UI 02 ----------
When(
  /^the admin creates a main category with name "([^"]*)"$/,
  async function (baseName: string) {
    // Use dynamic name with prefix and truncated timestamp for length constraint
    createdCategoryName = `Cat${Date.now().toString().slice(-4)}`;

    await cp(this).fillCategoryName(createdCategoryName);
    await cp(this).selectParentEmpty();
    await cp(this).clickSave();
  }
);

Then("the categories page should show the created category", async function () {
  await cp(this).verifyOnCategoriesList();
  await cp(this).searchCategory(createdCategoryName);
  await cp(this).verifyListContains(createdCategoryName);
});

// ---------- CM2 UI 03 ----------
When(
  /^the admin creates a sub category with name "([^"]*)" under parent "([^"]*)"$/,
  async function (baseName: string, parentLabel: string) {
    // Use dynamic name with prefix and truncated timestamp for length constraint
    createdCategoryName = `Sub${Date.now().toString().slice(-4)}`;

    await cp(this).fillCategoryName(createdCategoryName);
    await cp(this).selectParentByLabel(parentLabel);
    await cp(this).clickSave();
  }
);

// ---------- CM2 UI 04 ----------
When("the admin tries to save category with empty name", async function () {
  await cp(this).fillCategoryName("");
  await cp(this).clickSave();
});

Then("the Category Name required validation should be shown", async function () {
  await cp(this).verifyNameRequiredError();
});

// ---------- CM2 UI 05 ----------
When("the admin enters an invalid name length and tries to save", async function () {
  // too short
  await cp(this).fillCategoryName("AA");
  await cp(this).clickSave();
  await cp(this).verifyNameLengthError();

  // too long
  await cp(this).fillCategoryName("ABCDEFGHIJK"); // 11 chars
  await cp(this).clickSave();
  await cp(this).verifyNameLengthError();
});

Then("the Category Name length validation should be shown", async function () {
  await cp(this).verifyNameLengthError();
});

When(/^the admin clicks Cancel on add\/edit page$/, async function () {
  await cp(this).clickCancel();
});

Then("the user should be redirected back to categories page", async function () {
  await cp(this).verifyOnCategoriesList();
});

// ---------- CM2 UI 06 ----------
Then("Add Category button should be hidden for user", async function () {
  await cp(this).verifyAddHiddenForUser();
});

// ---------- CM2 UI 07 ----------
Then("Edit and Delete actions should be hidden or disabled for user", async function () {
  await cp(this).verifyUserEditDeleteHiddenOrDisabled();
});

// ---------- CM2 UI 10 ----------
When("the user attempts to delete a category by request", async function () {
  // Get any id to attempt delete
  const id = await cp(this).getFirstCategoryIdFromListOrFallback();
  const status = await cp(this).attemptDeleteViaFetch(id);
  (this as any).lastDeleteStatus = status;
});

Then("the delete request should be forbidden or blocked", async function () {
  const status = (this as any).lastDeleteStatus;

  // Depending on how app behaves, it can return 401/403/404 or redirect.
  // For a "blocked" expectation, accept 401/403.
  expect([401, 403]).toContain(status);
});
