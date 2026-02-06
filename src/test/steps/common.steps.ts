import { Given } from "@cucumber/cucumber";

/* ================= COMMON LOGIN STEPS ================= */

Given("the user is logged in as Admin", async function () {
    await this.page.goto("http://localhost:8080/ui/login");

    await this.page.waitForSelector('input[name="username"]', { state: "visible" });
    await this.page.fill('input[name="username"]', "admin");
    await this.page.fill('input[name="password"]', "admin123");
    await this.page.click('button[type="submit"]');

    // Wait for login to complete/redirect - waiting for common header or URL change
    // Assuming a common element exists, or just wait for load state
    await this.page.waitForLoadState("networkidle");
    console.log("✓ Admin login complete (Common)");
});

Given("the user is logged in as User", async function () {
    await this.page.goto("http://localhost:8080/ui/login");

    await this.page.waitForSelector('input[name="username"]', { state: "visible" });
    await this.page.fill('input[name="username"]', "testuser");
    await this.page.fill('input[name="password"]', "test123");
    await this.page.click('button[type="submit"]');

    await this.page.waitForLoadState("networkidle");
    console.log("✓ User login complete (Common)");
});
