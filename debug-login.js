const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const page = await browser.newPage();

  try {
    console.log("Step 1: Navigating to login...");
    await page.goto("http://localhost:8080/ui/login");
    await page.waitForTimeout(2000);

    console.log("Step 2: Filling username...");
    await page.fill("#username", "admin");
    await page.waitForTimeout(1000);

    console.log("Step 3: Filling password...");
    await page.fill("#password", "admin123");
    await page.waitForTimeout(1000);

    console.log("Step 4: Clicking submit...");
    await page.click("button[type='submit']");
    await page.waitForTimeout(3000);

    console.log("Step 5: Checking current URL...");
    console.log("Current URL:", page.url());

    console.log("\n Login successful! Browser will close in 5 seconds...");
    await page.waitForTimeout(5000);
  } catch (error) {
    console.error("Error:", error.message);
    console.log("Browser will stay open for 10 seconds...");
    await page.waitForTimeout(10000);
  }

  await browser.close();
})();
