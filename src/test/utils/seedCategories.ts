import { APIRequestContext, request } from "@playwright/test";

// Category structure needed for plants
export const SEED_CATEGORIES = [
  {
    name: "Indoor",
    parentId: null,
  },
  {
    name: "Outdoor",
    parentId: null,
  },
  {
    name: "Flowers",
    parentId: null, // Will be linked to Indoor (31)
  },
  {
    name: "Succulents",
    parentId: null, // Will be linked to Indoor (31)
  },
  {
    name: "Shrubs",
    parentId: null, // Will be linked to Outdoor (32)
  },
  {
    name: "Herbs",
    parentId: null, // Will be linked to Outdoor (32)
  },
];

// Get or create admin token
async function getAdminToken(apiRequest: APIRequestContext): Promise<string> {
  const response = await apiRequest.post(
    "http://localhost:8080/api/auth/login",
    {
      data: {
        username: "admin",
        password: "admin123",
      },
    },
  );

  if (!response.ok()) {
    throw new Error(`Failed to get admin token: ${response.status()}`);
  }

  const data = await response.json();
  return data.token;
}

// Get existing categories
async function getExistingCategories(
  apiRequest: APIRequestContext,
  token: string,
): Promise<any[]> {
  const response = await apiRequest.get(
    "http://localhost:8080/api/categories",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok()) {
    throw new Error(`Failed to get categories: ${response.status()}`);
  }

  return await response.json();
}

// Seed required categories
export async function seedCategories(adminToken: string): Promise<void> {
  console.log("=== Starting to seed categories ===");

  // Create API request context
  const apiRequest = await request.newContext({
    baseURL: "http://localhost:8080",
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  });

  try {
    // Get existing categories
    const existingCategories = await getExistingCategories(
      apiRequest,
      adminToken,
    );
    console.log(`✓ Found ${existingCategories.length} existing categories`);

    // Log existing sub-categories with their parents
    const existingSubs = existingCategories.filter(
      (c: any) => c.parentName && c.parentName !== "-",
    );
    if (existingSubs.length > 0) {
      console.log(
        `✓ Existing sub-categories: ${existingSubs.map((c: any) => `${c.name}(parentName: ${c.parentName})`).join(", ")}`,
      );
    }

    // Delete invalid sub-categories (ones that have no parent)
    const subCategoryNames = ["Flowers", "Succulents", "Shrubs", "Herbs"];
    for (const subName of subCategoryNames) {
      const invalidCat = existingCategories.find(
        (c: any) =>
          c.name === subName && (!c.parentName || c.parentName === "-"),
      );
      if (invalidCat) {
        console.log(
          `⚠ Deleting invalid sub-category "${subName}" (ID: ${invalidCat.id}) - has no parent`,
        );
        const deleteResponse = await apiRequest.delete(
          `/api/categories/${invalidCat.id}`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          },
        );
        if (deleteResponse.ok()) {
          console.log(
            `✓ Deleted invalid sub-category "${subName}" (ID: ${invalidCat.id})`,
          );
        } else {
          console.log(`⚠ Failed to delete invalid sub-category "${subName}"`);
        }
      }
    }

    // Refetch categories after deletion
    const updatedCategories = await getExistingCategories(
      apiRequest,
      adminToken,
    );
    console.log(
      `✓ Refetched categories after cleanup: ${updatedCategories.length} total`,
    );

    // Create main categories first (Indoor, Outdoor)
    const mainCategories = ["Indoor", "Outdoor"];
    const createdCategories: any = {};

    for (const catName of mainCategories) {
      const exists = updatedCategories.find((c) => c.name === catName);
      if (exists) {
        console.log(
          `✓ Category "${catName}" already exists (ID: ${exists.id})`,
        );
        createdCategories[catName] = exists.id;
      } else {
        const response = await apiRequest.post("/api/categories", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: { name: catName },
        });

        if (response.ok()) {
          const created = await response.json();
          console.log(`✓ Created category "${catName}" (ID: ${created.id})`);
          createdCategories[catName] = created.id;
        } else {
          console.log(`⚠ Failed to create category "${catName}"`);
        }
      }
    }

    // Create sub-categories (Flowers, Succulents under Indoor; Shrubs, Herbs under Outdoor)
    const subCategories = [
      { name: "Flowers", parent: "Indoor" },
      { name: "Succulents", parent: "Indoor" },
      { name: "Shrubs", parent: "Outdoor" },
      { name: "Herbs", parent: "Outdoor" },
    ];

    for (const subCat of subCategories) {
      const exists = updatedCategories.find((c) => c.name === subCat.name);
      if (exists) {
        console.log(
          `✓ Sub-category "${subCat.name}" already exists (ID: ${exists.id})`,
        );
      } else {
        const parentId = createdCategories[subCat.parent];
        if (!parentId) {
          console.log(
            `⚠ Parent category "${subCat.parent}" not found, skipping "${subCat.name}"`,
          );
          continue;
        }

        console.log(
          `→ Creating sub-category "${subCat.name}" with parentId: ${parentId}`,
        );

        const response = await apiRequest.post("/api/categories", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: {
            name: subCat.name,
            parent: { id: parentId },
          },
        });

        if (response.ok()) {
          const created = await response.json();
          console.log(
            `✓ Created sub-category "${subCat.name}" under "${subCat.parent}" (ID: ${created.id})`,
          );
        } else {
          const error = await response.text();
          console.log(
            `⚠ Failed to create sub-category "${subCat.name}": ${error}`,
          );
        }
      }
    }

    console.log("=== Completed seeding categories ===");
  } finally {
    await apiRequest.dispose();
  }
}

// Check if required categories exist AND are properly configured as sub-categories
export async function areRequiredCategoriesSeeded(
  adminToken: string,
): Promise<boolean> {
  const apiRequest = await request.newContext({
    baseURL: "http://localhost:8080",
  });

  try {
    const response = await apiRequest.get("/api/categories", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!response.ok()) {
      return false;
    }

    const categories = await response.json();
    // Check if main categories exist
    const requiredNames = [
      "Indoor",
      "Outdoor",
      "Flowers",
      "Succulents",
      "Shrubs",
      "Herbs",
    ];

    // Verify all required categories exist
    const hasAllCategories = requiredNames.every((name) =>
      categories.some((c: any) => c.name === name),
    );

    // Verify sub-categories have parents (parentName is not "-")
    const subCategoryNames = ["Flowers", "Succulents", "Shrubs", "Herbs"];
    const hasProperParents = subCategoryNames.every((name) => {
      const cat = categories.find((c: any) => c.name === name);
      return cat && cat.parentName && cat.parentName !== "-";
    });

    return hasAllCategories && hasProperParents;
  } finally {
    await apiRequest.dispose();
  }
}
