import { Page, Locator, expect } from "@playwright/test";

export class SalesPage {
  readonly page: Page;
  readonly sellButton: Locator;
  readonly plantSelect: Locator;
  readonly quantityInput: Locator;
  readonly saveButton: Locator;
  readonly deleteButtons: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;
  readonly salesTable: Locator;

  constructor(page: Page) {
    this.page = page;

    this.sellButton = page.locator("a:has-text('Sell Plant')");
    this.saveButton = page.locator("button:has-text('Sell')");
    this.plantSelect = page.locator("select[name='plantId']");
    this.quantityInput = page.locator("input[name='quantity']");
    this.salesTable = page.locator("table");
    this.deleteButtons = page.locator("button.btn-outline-danger");
    this.confirmDeleteButton = page.locator("button:has-text('Confirm')");
    this.cancelDeleteButton = page.locator("button:has-text('Cancel')");
  }

  async navigateToSales() {
    await this.page.click("a[href='/ui/sales']");
    await this.page.waitForLoadState("networkidle");
  }

  async clickSellPlant() {
    await this.sellButton.click();
  }

  async getFirstAvailablePlant(): Promise<string> {
    const options = this.plantSelect.locator("option");
    const count = await options.count();

    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      const value = await options.nth(i).getAttribute("value");

      if (value && value !== "" && text && text.trim() !== "") {
        const plantName = text.split("(")[0].trim();
        return plantName;
      }
    }

    throw new Error("No plants available in dropdown");
  }

  async fillSaleForm(plantName: string, quantity: string) {
    const options = this.plantSelect.locator("option");
    const count = await options.count();
    let valueToSelect = "";

    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text?.includes(plantName)) {
        valueToSelect = (await options.nth(i).getAttribute("value")) || "";
        break;
      }
    }

    if (!valueToSelect) {
      throw new Error(`Plant '${plantName}' not found in dropdown`);
    }

    await this.plantSelect.selectOption(valueToSelect);

    if (quantity) {
      await this.quantityInput.fill(quantity);
    }
  }

  async saveSale() {
    await this.saveButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async verifySaleInList(plantName: string, quantity: string) {
    await expect(this.salesTable).toContainText(plantName);
    await expect(this.salesTable).toContainText(quantity);
  }
}
