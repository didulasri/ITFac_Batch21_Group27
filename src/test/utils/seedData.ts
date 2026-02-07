import { APIRequestContext, request } from "@playwright/test";

// Sample plant data to seed (uses category names, not hardcoded IDs)
// IDs will be generated dynamically as 0 (let API auto-generate) or next available ID
export const SEED_PLANTS = [
  {
    name: "Orchid",
    price: 800,
    quantity: 20,
    categoryName: "Flowers",
  },
  {
    name: "Rose",
    price: 500,
    quantity: 60,
    categoryName: "Flowers",
  },
  {
    name: "Hydrangea",
    price: 1000,
    quantity: 2,
    categoryName: "Shrubs",
  },
  {
    name: "Rosemary",
    price: 1500,
    quantity: 6,
    categoryName: "Herbs",
  },
  {
    name: "Thyme",
    price: 1300,
    quantity: 4,
    categoryName: "Herbs",
  },
  {
    name: "Aloe Vera",
    price: 400,
    quantity: 26,
    categoryName: "Succulents",
  },
  {
    name: "Daisy",
    price: 590,
    quantity: 12,
    categoryName: "Flowers",
  },
  {
    name: "Azalea",
    price: 1600,
    quantity: 5,
    categoryName: "Shrubs",
  },
];

// Get admin token for API requests
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

// Get category with parentName mapping
async function getCategories(
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

// Build category object from parentName
function buildCategoryObject(category: any, allCategories: any[]): any {
  let parent = null;

  // If category has a parentName and it's not the root indicator "-"
  if (category.parentName && category.parentName !== "-") {
    const parentCat = allCategories.find((c) => c.name === category.parentName);
    if (parentCat) {
      parent = {
        id: parentCat.id,
        name: parentCat.name,
        parent: null,
      };
    }
  }

  return {
    id: category.id,
    name: category.name,
    parent: parent,
    subCategories: [],
  };
}

// Seed plant data to database
export async function seedPlants(adminToken: string): Promise<void> {
  console.log("=== Starting to seed plants ===");

  // Create API request context
  const apiRequest = await request.newContext({
    baseURL: "http://localhost:8080",
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  });

  try {
    // Get all categories
    const categories = await getCategories(apiRequest, adminToken);
    console.log(`✓ Fetched ${categories.length} categories`);

    // Seed each plant
    for (const plant of SEED_PLANTS) {
      const category = categories.find((c) => c.name === plant.categoryName);

      if (!category) {
        console.log(
          `⚠ Skipping plant "${plant.name}" - category "${plant.categoryName}" not found`,
        );
        continue;
      }

      // Check if category is a sub-category (must have parentName)
      if (!category.parentName || category.parentName === "-") {
        console.log(
          `⚠ Skipping plant "${plant.name}" - category "${plant.categoryName}" (ID: ${category.id}) is not a sub-category`,
        );
        continue;
      }

      // Build category object with parent
      const categoryObject = buildCategoryObject(category, categories);

      // Create plant payload
      const plantData = {
        id: 0,
        name: plant.name,
        price: plant.price,
        quantity: plant.quantity,
        category: categoryObject,
      };

      // Send POST request to create plant
      const response = await apiRequest.post(
        `/api/plants/category/${category.id}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          data: plantData,
        },
      );

      if (response.ok()) {
        console.log(
          `✓ Seeded plant: "${plant.name}" (Category: ${plant.categoryName}, ID: ${category.id})`,
        );
      } else {
        const error = await response.text();
        console.log(
          `⚠ Failed to seed plant "${plant.name}": ${response.status()} - ${error}`,
        );
      }
    }

    console.log("=== Completed seeding plants ===");
  } finally {
    await apiRequest.dispose();
  }
}

// Check if plants already seeded
export async function areTestPlantsSeeded(
  adminToken: string,
): Promise<boolean> {
  const apiRequest = await request.newContext({
    baseURL: "http://localhost:8080",
  });

  try {
    const response = await apiRequest.get("/api/plants", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!response.ok()) {
      return false;
    }

    const plants = await response.json();
    // Check if any of our seed plants exist
    const seedPlantNames = SEED_PLANTS.map((p) => p.name);
    const hasSeededPlants = plants.some((p: any) =>
      seedPlantNames.includes(p.name),
    );

    return hasSeededPlants;
  } finally {
    await apiRequest.dispose();
  }
}
