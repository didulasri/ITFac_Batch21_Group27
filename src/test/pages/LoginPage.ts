import { Page, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto("http://localhost:8080/ui/login");
    await this.page.waitForLoadState("networkidle");
  }

  async loginAsAdmin() {
    await this.navigate();
    await this.page.fill("input[name='username']", "admin");
    await this.page.fill("input[name='password']", "admin123");
    await this.page.click("button[type='submit']");
    await this.page.waitForLoadState("networkidle");
    await this.page
      .waitForSelector(".sidebar", { timeout: 10000 })
      .catch(() => console.log("Sidebar not found?"));
    console.log("Logged in as Admin");
  }

  async loginAsUser() {
    await this.navigate();
    await this.page.fill("input[name='username']", "testuser");
    await this.page.fill("input[name='password']", "test123");
    await this.page.click("button[type='submit']");
    await this.page.waitForLoadState("networkidle");
    console.log("Logged in as User");
  }
}
