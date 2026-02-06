import { When, Then } from "@cucumber/cucumber";
import { CategoryPage } from "../pages/CategoryPage";

// Login steps are in common.steps.ts (shared across all modules)
let categoryPage: CategoryPage;
let firstRowBeforePagination = "";
let existingCategoryId: string | null = null;

function cp(world: any): CategoryPage {
  if (!categoryPage || categoryPage["page"] !== world.page) {
    categoryPage = new CategoryPage(world.page);
  }
  return categoryPage;
}

/* ================= OPEN PAGE ================= */
When("the admin opens the categories page", async function () {
  categoryPage = cp(this);
  await categoryPage.openCategoryListing();

  // Capture an existing ID for edit access test (if available)
  const idCell = this.page.locator("tbody tr:first-child td:nth-child(1)");
  if (await idCell.count()) {
    existingCategoryId = (await idCell.textContent())?.trim() ?? null;
  }
});

When("the user opens the categories page", async function () {
  categoryPage = cp(this);
  await categoryPage.openCategoryListing();

  const idCell = this.page.locator("tbody tr:first-child td:nth-child(1)");
  if (await idCell.count()) {
    existingCategoryId = (await idCell.textContent())?.trim() ?? null;
  }
});

/* ================= COMMON ASSERTION ================= */
Then("the list of categories should be displayed", async function () {
  await categoryPage.verifyCategoriesDisplayed();
});

/* ================= SEARCH ================= */
When("the admin searches for category {string}", async function (name: string) {
  await categoryPage.searchCategory(name);
});

When("the user searches for category {string}", async function (name: string) {
  await categoryPage.searchCategory(name);
});

Then("only categories matching {string} should be displayed", async function (text: string) {
  await categoryPage.verifySearchResultsContain(text);
});

/* ================= FILTER ================= */
When("the admin filters categories by parent {string}", async function (parent: string) {
  await categoryPage.filterByParent(parent);
});

When("the user filters categories by parent {string}", async function (parent: string) {
  await categoryPage.filterByParent(parent);
});

Then("only categories under parent {string} should be displayed", async function (parent: string) {
  await categoryPage.verifyParentResults(parent);
});

/* ================= SORT ================= */
When("the admin sorts categories by {string}", async function (column: string) {
  await categoryPage.sortBy(column as any);
});

Then("categories should be sorted by {string}", async function (column: string) {
  await categoryPage.verifySorted(column as any);
});

/* ================= PAGINATION ================= */
When("the admin goes to the next page in category pagination", async function () {
  firstRowBeforePagination = await categoryPage.goToNextPage();
});

Then("the next set of categories should be displayed", async function () {
  await categoryPage.verifyPaginationChanged(firstRowBeforePagination);
});

/* ================= USER ROLE RESTRICTIONS ================= */
Then("admin-only category controls should not be visible", async function () {
  await categoryPage.verifyAdminControlsHidden();
});

When("the user tries to open the add category page", async function () {
  await this.page.goto("http://localhost:8080/ui/categories/add");
});

When("the user tries to open the edit category page for an existing category", async function () {
  const id = existingCategoryId ?? "1";
  await this.page.goto(`http://localhost:8080/ui/categories/edit/${id}`);
});

Then("access should be denied", async function () {
  await categoryPage.verifyAccessDenied();
});
