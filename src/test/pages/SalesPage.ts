import { expect, type Page, type Locator } from "@playwright/test";

export class SalesPage {
  readonly page: Page;

  // Locators
  readonly salesMenuLink: Locator;
  readonly sellPlantButton: Locator;
  readonly saleRows: Locator;
  readonly plantSelect: Locator;
  readonly quantityInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator; // If modal has one

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.salesMenuLink = page.locator(".sidebar a:has-text('Sales')");

    // Main Page
    this.sellPlantButton = page.locator("button:has-text('Sell Plant')");
    this.saleRows = page.locator("tbody tr");

    // Sell Modal/Form
    this.plantSelect = page.locator("select[name='plantId']");
    this.quantityInput = page.locator("input[name='quantity']");
    this.saveButton = page.locator("button:has-text('Save')");
    this.cancelButton = page.locator("button:has-text('Cancel')");
    // Assuming generic error container or toast
    this.errorMessage = page.locator(".alert.alert-danger, .error-message");

    // Delete Confirmation Modal
    this.confirmDeleteButton = page.locator(".modal button:has-text('Yes')");
    this.cancelDeleteButton = page.locator(".modal button:has-text('No')");
  }

  // ================= ACTIONS =================

  async navigateToSales() {
    await this.salesMenuLink.click();
  }

  async clickSellPlant() {
    await this.sellPlantButton.click();
  }

  async selectPlant(plantName: string) {
    await this.plantSelect.selectOption({ label: plantName });
  }

  async enterQuantity(qty: string) {
    await this.quantityInput.fill(qty);
  }

  async submitSale() {
    await this.saveButton.click();
  }

  async deleteSale(rowIndex: number = 0) {
    // Click delete on the first row or specified index
    await this.saleRows.nth(rowIndex).locator("button[title='Delete']").click();
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click();
  }

  async cancelDeleteAction() {
    await this.cancelDeleteButton.click();
  }

  // ================= ASSERTIONS =================

  async verifySaleCreated(plantName: string) {
    await expect(this.saleRows.first()).toContainText(plantName);
  }

  async verifyErrorMessage(msg: string) {
    await expect(this.errorMessage).toContainText(msg);
    await expect(this.errorMessage).toBeVisible();
  }

  async verifySaleDeleted(plantName: string) {
    await expect(this.saleRows).not.toContainText(plantName);
  }

  async verifySaleExists(plantName: string) {
    await expect(this.saleRows).toContainText(plantName);
  }

  async verifySellButtonVisible() {
    await expect(this.sellPlantButton).toBeVisible();
  }

  async verifySellButtonHidden() {
    await expect(this.sellPlantButton).toBeHidden();
  }

  async verifyDeleteButtonHidden() {
    const deleteButtons = this.page.locator("button[title='Delete']");
    await expect(deleteButtons).toHaveCount(0);
  }

  async verifySalesListVisible() {
    await expect(this.page.locator("table")).toBeVisible();
    await expect(this.page.locator("th:has-text('Plant')")).toBeVisible();
    await expect(this.page.locator("th:has-text('Quantity')")).toBeVisible();
  }
}
