import { When, Then } from "@cucumber/cucumber";
import { CategoryPage } from "../pages/CategoryPage";

let categoryPage: CategoryPage;
let firstRowBeforePagination = "";
let existingCategoryId: string | null = null;

function cp(world: any): CategoryPage {
  if (!categoryPage || categoryPage["page"] !== world.page) {
    categoryPage = new CategoryPage(world.page);
  }
  return categoryPage;
}

import { DataSeeder } from "../utils/DataSeeder";

When("standard test categories exist", async function () {
  const requester = this.apiRequest || this.page.request;
  const baseUrl = "http://localhost:8080";
  const dataSeeder = new DataSeeder(requester, baseUrl);

  const parentName = `Flw${Date.now().toString().slice(-4)}`;
  const subName = `Ros${Date.now().toString().slice(-4)}`;

  const seeded = await dataSeeder.createCategoryHierarchy(parentName, subName);

  this.seededData = {
    parentCategoryName: seeded.mainCategoryName,
    subCategoryName: seeded.subCategoryName,
  };

  for (let i = 0; i < 12; i++) {
    await dataSeeder.createCategoryHierarchy(
      `B${i}-${Date.now().toString().slice(-4)}`,
    );
  }

  console.log(
    `Standard test categories seeded. Parent: ${this.seededData.parentCategoryName}, Sub: ${this.seededData.subCategoryName}`,
  );
});

When("the admin opens the categories page", async function () {
  categoryPage = cp(this);
  await categoryPage.openCategoryListing();

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

Then("the list of categories should be displayed", async function () {
  await categoryPage.verifyCategoriesDisplayed();
});

When("the admin searches for the seeded category name", async function () {
  if (!this.seededData?.subCategoryName) {
    throw new Error(
      "Seeded 'subCategoryName' is missing. Did 'standard test categories exist' run?",
    );
  }
  await categoryPage.searchCategory(this.seededData.subCategoryName);
});

When("the user searches for the seeded category name", async function () {
  if (!this.seededData?.subCategoryName) {
    throw new Error(
      "Seeded 'subCategoryName' is missing. Did 'standard test categories exist' run?",
    );
  }
  await categoryPage.searchCategory(this.seededData.subCategoryName);
});

Then(
  "only categories matching the seeded category name should be displayed",
  async function () {
    if (!this.seededData?.subCategoryName) {
      throw new Error("Seeded 'subCategoryName' is missing.");
    }
    await categoryPage.verifySearchResultsContain(
      this.seededData.subCategoryName,
    );
  },
);

When(
  "the admin filters categories by the seeded parent category",
  async function () {
    if (!this.seededData?.parentCategoryName) {
      throw new Error("Seeded 'parentCategoryName' is missing.");
    }
    await categoryPage.filterByParent(this.seededData.parentCategoryName);
  },
);

When(
  "the user filters categories by the seeded parent category",
  async function () {
    if (!this.seededData?.parentCategoryName) {
      throw new Error("Seeded 'parentCategoryName' is missing.");
    }
    await categoryPage.filterByParent(this.seededData.parentCategoryName);
  },
);

Then(
  "only categories under the seeded parent category should be displayed",
  async function () {
    if (!this.seededData?.parentCategoryName) {
      throw new Error("Seeded 'parentCategoryName' is missing.");
    }
    await categoryPage.verifyParentResults(this.seededData.parentCategoryName);
  },
);

When("the admin sorts categories by {string}", async function (column: string) {
  await categoryPage.sortBy(column as any);
});

Then(
  "categories should be sorted by {string}",
  async function (column: string) {
    await categoryPage.verifySorted(column as any);
  },
);

When(
  "the admin goes to the next page in category pagination",
  async function () {
    firstRowBeforePagination = await categoryPage.goToNextPage();
  },
);

Then("the next set of categories should be displayed", async function () {
  await categoryPage.verifyPaginationChanged(firstRowBeforePagination);
});

Then("admin-only category controls should not be visible", async function () {
  await cp(this).verifyAdminControlsHidden();
});

When("the user tries to open the add category page", async function () {
  await this.page.goto("http://localhost:8080/ui/categories/add");
  await this.page.waitForLoadState("networkidle");
});

When(
  "the user tries to open the edit category page for an existing category",
  async function () {
    const id = existingCategoryId ?? "1";
    await this.page.goto(`http://localhost:8080/ui/categories/edit/${id}`);
    await this.page.waitForLoadState("networkidle");
  },
);

Then("access should be denied", async function () {
  await cp(this).verifyAccessDenied();
});
