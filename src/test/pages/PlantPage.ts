import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class PlantPage {
  readonly page: Page;

  // Locators
  readonly plantRows: Locator;
  readonly searchInput: Locator;
  readonly categoryDropdown: Locator;
  readonly sortByNameButton: Locator;
  readonly lowStockBadge: Locator;
  readonly adminEditButton: Locator;
  readonly adminDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ---- BASIC LISTING ----
    this.plantRows = page.locator("tbody tr");

    // ---- SEARCH ----
    this.searchInput = page.locator("input[name='name']");

    // ---- FILTER ----
    this.categoryDropdown = page.locator("select[name='categoryId']");

    // ---- SORT ----
    this.sortByNameButton = page.locator("button:has-text('Sort by Name')");

    // ---- LOW STOCK ----
    this.lowStockBadge = page.locator(".badge.bg-danger");

    // ---- ADMIN CONTROLS ----
    this.adminEditButton = page.locator("a[title='Edit']");
    this.adminDeleteButton = page.locator("button[title='Delete']");
  }

  // ================= ACTIONS =================

  async openPlantListing() {
    await this.page.click(".sidebar a:has-text('Plants')");
  }

  async searchPlant(name: string) {
    await this.searchInput.fill(name);
    await this.searchInput.press("Enter");
  }

  async filterByCategory(category: string) {
    await this.categoryDropdown.selectOption({ label: category });
    await this.page.click("button:has-text('Search')");
  }

  async sortByName() {
    await this.sortByNameButton.click();
  }

  // ================= ASSERTIONS =================

  async verifyPlantsDisplayed() {
    await expect(this.plantRows.first()).toBeVisible();
  }

  async verifySearchResultsContain(text: string) {
    const rowsCount = await this.plantRows.count();
    for (let i = 0; i < rowsCount; i++) {
      await expect(this.plantRows.nth(i)).toContainText(text);
    }
  }

  async verifyCategoryResults(category: string) {
    const rowsCount = await this.plantRows.count();
    for (let i = 0; i < rowsCount; i++) {
      await expect(this.plantRows.nth(i)).toContainText(category);
    }
  }

  async verifyLowStockVisible() {
    await expect(this.lowStockBadge.first()).toBeVisible();
  }

  async verifySortedAlphabetically() {
    const names = await this.plantRows.allTextContents();
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
  }

  async verifyAdminControlsVisible() {
    await expect(this.adminEditButton.first()).toBeVisible();
    await expect(this.adminDeleteButton.first()).toBeVisible();
  }

  async verifyAdminControlsHidden() {
    await expect(this.adminEditButton).toHaveCount(0);
    await expect(this.adminDeleteButton).toHaveCount(0);
  }
}
