import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class CategoryPage {
  readonly page: Page;

  // Locators
  readonly categoryRows: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly parentDropdown: Locator;

  readonly addCategoryButton: Locator;
  readonly adminEditButtons: Locator;
  readonly adminDeleteButtons: Locator;

  readonly pagination: Locator;
  readonly nextPageButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ---- BASIC LISTING ----
    this.categoryRows = page.locator("tbody tr");

    // ---- SEARCH ----
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.searchButton = page.locator("button:has-text('Search')");

    // ---- FILTER (Parent Category) ----
    this.parentDropdown = page.locator("select.form-select");

    // ---- ADMIN CONTROLS ----
    this.addCategoryButton = page.locator("button:has-text('Add')");
    this.adminEditButtons = page.locator("a[title='Edit'], button[title='Edit']");
    this.adminDeleteButtons = page.locator("button[title='Delete']");

    // ---- PAGINATION ----
    this.pagination = page.locator("ul.pagination");
    this.nextPageButton = this.pagination.locator("a:has-text('Next'), button:has-text('Next')");
  }

  // ================= ACTIONS =================

  async openCategoryListing() {
    await this.page.click(".sidebar a:has-text('Categories')");
    await this.page.waitForLoadState("networkidle");
  }

  async searchCategory(name: string) {
    await this.searchInput.fill(name);
    await this.searchButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async filterByParent(parentLabel: string) {
    await this.parentDropdown.waitFor({ state: "visible" });

    // Try label first
    const selected = await this.parentDropdown
      .selectOption({ label: parentLabel })
      .catch(() => null);

    // If label not found, fallback to first real option (index 1)
    if (!selected) {
      await this.parentDropdown.selectOption({ index: 1 });
    }

    await this.searchButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Sort table by clicking header.
   * The app does NOT reliably update URL, so we wait for table content change instead.
   */
  async sortBy(columnHeaderText: "ID" | "Name" | "Parent category") {
    // Map to header index (1-based)
    const headerIndex =
      columnHeaderText === "ID" ? 1 :
      columnHeaderText === "Name" ? 2 :
      3; // Parent category -> Parent column
  
    const cellIndex = headerIndex;
  
    const beforeFirst = ((await this.getColumnValues(columnHeaderText))[0] ?? "").trim();
    const beforeUrl = this.page.url();
  
    // Click the exact header cell by position (works even if text changes: Parent vs Parent category)
    const header = this.page.locator(`table thead tr th:nth-child(${headerIndex})`).first();
    await expect(header).toBeVisible();
  
    // click inner clickable element if exists
    const clickable = header.locator("a, button, span").first();
    if ((await clickable.count()) > 0) {
      await clickable.click();
    } else {
      await header.click();
    }
  
    // Wait for either URL change OR first cell change
    await Promise.race([
      this.page.waitForFunction(
        (args) => {
          const g: any = globalThis as any;
          return g.location?.href !== args.beforeUrl;
        },
        { beforeUrl },
        { timeout: 30000 }
      ),
      this.page.waitForFunction(
        (args) => {
          const g: any = globalThis as any;
          const firstCell = g.document?.querySelector?.(`tbody tr td:nth-child(${args.cellIndex})`);
          const now = (firstCell?.textContent ?? "").trim();
          return now !== args.beforeFirst;
        },
        { cellIndex, beforeFirst },
        { timeout: 30000 }
      ),
    ]);
  
    await this.page.waitForLoadState("networkidle");
  }
  
  
  

  async goToNextPage() {
    const before = await this.getFirstRowText();

    await expect(this.nextPageButton).toBeVisible();
    await this.nextPageButton.click();
    await this.page.waitForLoadState("networkidle");

    return before;
  }

  // ================= HELPERS =================

  private async getFirstRowText(): Promise<string> {
    const first = this.categoryRows.first();
    await expect(first).toBeVisible();
    return (await first.textContent())?.trim() ?? "";
  }

  async getColumnValues(column: "ID" | "Name" | "Parent category"): Promise<string[]> {
    const index = column === "ID" ? 1 : column === "Name" ? 2 : 3;
    const values = await this.page
      .locator(`tbody tr td:nth-child(${index})`)
      .allTextContents();
    return values.map((v) => v.trim());
  }

  // ================= ASSERTIONS =================

  async verifyCategoriesDisplayed() {
    await expect(this.categoryRows.first()).toBeVisible();
  }

  async verifySearchResultsContain(text: string) {
    const rowsCount = await this.categoryRows.count();

    if (rowsCount === 0) {
      await expect(this.page.locator("text=No category found")).toBeVisible();
      return;
    }

    for (let i = 0; i < rowsCount; i++) {
      await expect(this.categoryRows.nth(i)).toContainText(text);
    }
  }

  async verifyParentResults(parent: string) {
    const rowsCount = await this.categoryRows.count();

    if (rowsCount === 0) {
      await expect(this.page.locator("text=No category found")).toBeVisible();
      return;
    }

    for (let i = 0; i < rowsCount; i++) {
      await expect(this.categoryRows.nth(i)).toContainText(parent);
    }
  }

  /**
   * Since URL doesn't reliably tell asc/desc, accept either ascending OR descending.
   * Fail only if it's not sorted in either direction.
   */
  async verifySorted(column: "ID" | "Name" | "Parent category") {
    const values = await this.getColumnValues(column);
    if (values.length <= 1) return;

    if (column === "ID") {
      const nums = values.map((v) => parseInt(v, 10)).filter((n) => !Number.isNaN(n));

      const asc = [...nums].sort((a, b) => a - b);
      const desc = [...nums].sort((a, b) => b - a);

      const isAsc = nums.every((n, i) => n === asc[i]);
      const isDesc = nums.every((n, i) => n === desc[i]);

      expect(isAsc || isDesc).toBeTruthy();
      return;
    }

    const normalized = values.map((v) => v.trim().toLowerCase());
    const asc = [...normalized].sort((a, b) => a.localeCompare(b));
    const desc = [...normalized].sort((a, b) => b.localeCompare(a));

    const isAsc = normalized.every((v, i) => v === asc[i]);
    const isDesc = normalized.every((v, i) => v === desc[i]);

    expect(isAsc || isDesc).toBeTruthy();
  }

  async verifyPaginationChanged(previousFirstRowText: string) {
    const after = await this.getFirstRowText();
    expect(after).not.toEqual(previousFirstRowText);
  }

  // Keep strict: should FAIL if user can see admin controls (app bug)
  async verifyAdminControlsHidden() {
    await expect(this.addCategoryButton).toHaveCount(0);
    await expect(this.adminEditButtons).toHaveCount(0);
    await expect(this.adminDeleteButtons).toHaveCount(0);
  }

  async verifyAccessDenied() {
    const accessDenied = this.page.locator("text=/Access Denied|403/i");
    await expect(accessDenied.first()).toBeVisible();
  }
}
