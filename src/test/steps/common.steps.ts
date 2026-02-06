import { Given } from "@cucumber/cucumber";

/* ================= SHARED LOGIN STEPS =================
 * These are used by multiple modules (categories, plants, sales, etc.)
 * Defined here ONCE to avoid AMBIGUOUS errors when running all tests together.
 */

Given("the user is logged in as Admin", async function () {
  await this.page.goto("http://localhost:8080/ui/login");

  await this.page.waitForSelector('input[name="username"]', { state: "visible" });
  await this.page.fill('input[name="username"]', "admin");
  await this.page.fill('input[name="password"]', "admin123");
  await this.page.click('button[type="submit"]');

  await this.page.waitForLoadState("networkidle");

  console.log("✓ Admin login complete");
});

Given("the user is logged in as User", async function () {
  await this.page.goto("http://localhost:8080/ui/login");

  await this.page.waitForSelector('input[name="username"]', { state: "visible" });
  await this.page.fill('input[name="username"]', "testuser");
  await this.page.fill('input[name="password"]', "test123");
  await this.page.click('button[type="submit"]');

  await this.page.waitForLoadState("networkidle");

  console.log("✓ User login complete");
});
