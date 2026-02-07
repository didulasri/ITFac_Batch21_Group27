import { Before } from "@cucumber/cucumber";
import { request } from "@playwright/test";
import { seedPlants, areTestPlantsSeeded } from "../utils/seedData";
import {
  seedCategories,
  areRequiredCategoriesSeeded,
} from "../utils/seedCategories";

// Track if seeding has been done in this test run
let seedingDone = false;

/**
 * Separate hook for seeding test data
 * This hook runs before scenarios tagged with @PM1, @PM2, @PM1-API, @PM1-UI, @PM2-API, or @PM2-UI
 * It checks if data is already seeded and skips if not needed
 * The seeding is done only ONCE per test run to avoid redundant operations
 */
Before(
  {
    tags: "@PM1 or @PM2 or @PM1-API or @PM1-UI or @PM2-API or @PM2-UI",
    timeout: 120000,
  },
  async function (scenario) {
    // Skip if we've already seeded in this test run
    if (seedingDone) {
      console.log("✓ Seeding already completed in this test run, skipping");
      return;
    }

    console.log(
      `=== PM Seed Hook: Preparing test data for scenario: ${scenario.pickle.name} ===`,
    );

    try {
      // Create a temporary API context just for seeding
      const apiRequest = await request.newContext({
        baseURL: "http://localhost:8080",
        extraHTTPHeaders: {
          "Content-Type": "application/json",
        },
      });

      // Get admin token
      const loginResponse = await apiRequest.post("/api/auth/login", {
        data: {
          username: "admin",
          password: "admin123",
        },
      });

      if (!loginResponse.ok()) {
        console.log(
          `⚠ Could not authenticate for seeding: ${loginResponse.status()}`,
        );
        await apiRequest.dispose();
        return;
      }

      const loginData = await loginResponse.json();
      const adminToken = loginData.token;

      // Step 1: Seed categories first (required for plants)
      const categoriesSeeded = await areRequiredCategoriesSeeded(adminToken);

      if (categoriesSeeded) {
        console.log(
          "✓ Required categories already exist in database, skipping category seed",
        );
      } else {
        console.log("⚠ Required categories not found, seeding categories...");
        await seedCategories(adminToken);
      }

      // Step 2: Seed plants (now that categories exist)
      const isSeeded = await areTestPlantsSeeded(adminToken);

      if (isSeeded) {
        console.log(
          "✓ Test plants already exist in database, skipping seed operation",
        );
      } else {
        console.log("⚠ Test plants not found, seeding now...");
        await seedPlants(adminToken);
      }

      // Mark seeding as done for this test run
      seedingDone = true;

      await apiRequest.dispose();
    } catch (error) {
      console.error(`✗ Error in seed hook: ${error}`);
    }

    console.log("=== PM Seed Hook: Completed (test data ready) ===\n");
  },
);
