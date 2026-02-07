import { APIRequestContext } from "@playwright/test";
import { ApiHelper } from "./api-helper";
import { AuthHelper } from "./auth-helper";

export class DataSeeder {
  private apiHelper: ApiHelper;
  private authHelper: AuthHelper;
  private baseUrl: string;

  constructor(request: APIRequestContext, baseUrl: string) {
    this.baseUrl = baseUrl;
    this.apiHelper = new ApiHelper(request, baseUrl);
    this.authHelper = new AuthHelper(request, baseUrl);
  }

  async createCategoryHierarchy(mainName?: string, subName?: string) {
    console.log("🌱 Seeding Category Hierarchy...");
    const adminToken = await this.authHelper.loginAdmin();
    this.apiHelper.setAuthToken(adminToken);

    const mainCatName = mainName || `Main${Date.now().toString().slice(-6)}`;
    const mainCatResponse = await this.apiHelper.post("/api/categories", {
      name: mainCatName,
    });

    if (mainCatResponse.status() === 400 || mainCatResponse.status() === 409) {
      console.log(
        `ℹ Category '${mainCatName}' might already exist. Fetching...`,
      );
      const allCatsRes = await this.apiHelper.get("/api/categories?size=1000");
      const allCats = await this.apiHelper.getResponseBody(allCatsRes);
      console.log(
        "DEBUG: MainCats type:",
        typeof allCats,
        "IsArray:",
        Array.isArray(allCats),
      );
      const catsList = Array.isArray(allCats) ? allCats : allCats.content || [];
      const existing = catsList.find((c: any) => c.name === mainCatName);
      if (existing) {
        console.log(
          `✓ Found existing Main Category: ${existing.name} (ID: ${existing.id})`,
        );
        // We need to return this as mainCat
        // Refactor to use a variable for 'mainCat'
        var mainCat = existing;
      } else {
        throw new Error(
          `Failed to seed Main Category '${mainCatName}' and could not find it. Status: ${mainCatResponse.status()}`,
        );
      }
    } else if (mainCatResponse.status() !== 201) {
      throw new Error(
        `Failed to seed Main Category. Status: ${mainCatResponse.status()}`,
      );
    } else {
      var mainCat = await this.apiHelper.getResponseBody(mainCatResponse);
    }

    const subCatName = subName || `Sub${Date.now().toString().slice(-6)}`;
    const subCatResponse = await this.apiHelper.post("/api/categories", {
      name: subCatName,
      parent: { id: mainCat.id },
    });

    if (subCatResponse.status() === 400 || subCatResponse.status() === 409) {
      console.log(
        `ℹ SubCategory '${subCatName}' might already exist. Fetching...`,
      );
      const allCatsRes = await this.apiHelper.get("/api/categories?size=1000");
      const allCats = await this.apiHelper.getResponseBody(allCatsRes);
      console.log(
        "DEBUG: SubCats type:",
        typeof allCats,
        "IsArray:",
        Array.isArray(allCats),
      );
      const catsList = Array.isArray(allCats) ? allCats : allCats.content || [];
      let existingSub = catsList.find(
        (c: any) =>
          c.name === subCatName && c.parent && c.parent.id === mainCat.id,
      );

      if (!existingSub) {
        console.log(
          `ℹ SubCat '${subCatName}' not found by parent. Trying by name...`,
        );
        existingSub = catsList.find((c: any) => c.name === subCatName);
      }

      if (existingSub) {
        console.log(
          `✓ Found existing Sub Category: ${existingSub.name} (ID: ${existingSub.id})`,
        );
        var subCat = existingSub;
      } else {
        const existingByName = allCats.find((c: any) => c.name === subCatName);
        if (existingByName) {
          var subCat = existingByName;
        } else {
          throw new Error(
            `Failed to seed Sub Category '${subCatName}'. Status: ${subCatResponse.status()}`,
          );
        }
      }
    } else if (subCatResponse.status() !== 201) {
      throw new Error(
        `Failed to seed Sub Category. Status: ${subCatResponse.status()}`,
      );
    } else {
      var subCat = await this.apiHelper.getResponseBody(subCatResponse);
    }

    console.log(
      `✅ Seeded Categories: ${mainCat.name} (ID: ${mainCat.id}) -> ${subCat.name} (ID: ${subCat.id})`,
    );

    return {
      mainCategoryId: mainCat.id,
      mainCategoryName: mainCat.name,
      subCategoryId: subCat.id,
      subCategoryName: subCat.name,
    };
  }

  async createPlant(subCategoryId?: string, name?: string) {
    console.log("🌱 Seeding Plant...");

    let targetSubCatId = subCategoryId;

    if (!targetSubCatId) {
      const cats = await this.createCategoryHierarchy();
      targetSubCatId = cats.subCategoryId;
    } else {
      const adminToken = await this.authHelper.loginAdmin();
      this.apiHelper.setAuthToken(adminToken);
    }

    const plantName = name || `Plant${Date.now().toString().slice(-6)}`;
    const plantResponse = await this.apiHelper.post(
      `/api/plants/category/${targetSubCatId}`,
      {
        name: plantName,
        price: 25.99,
        quantity: 100,
      },
    );

    if (plantResponse.status() === 400 || plantResponse.status() === 409) {
      console.log(`ℹ Plant '${plantName}' might already exist. Fetching...`);
      const plantsRes = await this.apiHelper.get(
        `/api/plants/category/${targetSubCatId}`,
      );
      if (plantsRes.status() === 200) {
        const plants = await this.apiHelper.getResponseBody(plantsRes);
        const existingPlant = plants.find((p: any) => p.name === plantName);
        if (existingPlant) {
          console.log(
            `✓ Found existing Plant: ${existingPlant.name} (ID: ${existingPlant.id})`,
          );
          var plant = existingPlant;
        } else {
          throw new Error(
            `Failed to seed Plant '${plantName}' and could not find it in category ${targetSubCatId}. Status: ${plantResponse.status()}`,
          );
        }
      } else {
        throw new Error(
          `Failed to seed Plant '${plantName}'. Status: ${plantResponse.status()}`,
        );
      }
    } else if (plantResponse.status() !== 201) {
      const error = await this.apiHelper.getResponseBody(plantResponse);
      console.error("Seeding Plant Failed:", error);
      throw new Error(
        `Failed to seed Plant. Status: ${plantResponse.status()}`,
      );
    } else {
      var plant = await this.apiHelper.getResponseBody(plantResponse);
    }

    console.log(`✅ Seeded Plant: ${plant.name} (ID: ${plant.id})`);

    return {
      plantId: plant.id,
      plantName: plant.name,
      subCategoryId: targetSubCatId,
    };
  }

  async createSale(plantId?: string) {
    console.log("🌱 Seeding Sale...");

    let targetPlantId = plantId;

    if (!targetPlantId) {
      const plantData = await this.createPlant();
      targetPlantId = plantData.plantId;
    } else {
      const adminToken = await this.authHelper.loginAdmin();
      this.apiHelper.setAuthToken(adminToken);
    }

    const saleResponse = await this.apiHelper.post(
      `/api/sales/plant/${targetPlantId}?quantity=1`,
      {},
    );

    if (saleResponse.status() !== 201) {
      throw new Error(`Failed to seed Sale. Status: ${saleResponse.status()}`);
    }

    const sale = await this.apiHelper.getResponseBody(saleResponse);
    console.log(`✅ Seeded Sale ID: ${sale.id}`);

    return {
      saleId: sale.id,
      plantId: targetPlantId,
    };
  }

  /* ==================== BASELINE SEEDING ==================== */

  private static readonly SEED_CATEGORIES = [
    { name: "Indoor", parent: null },
    { name: "Outdoor", parent: null },
    { name: "Flowers", parent: "Indoor" },
    { name: "Succulents", parent: "Indoor" },
    { name: "Shrubs", parent: "Outdoor" },
    { name: "Herbs", parent: "Outdoor" },
  ];

  private static readonly SEED_PLANTS = [
    { name: "Orchid", price: 800, quantity: 20, categoryName: "Flowers" },
    { name: "Rose", price: 500, quantity: 60, categoryName: "Flowers" },
    { name: "Hydrangea", price: 1000, quantity: 2, categoryName: "Shrubs" },
    { name: "Rosemary", price: 1500, quantity: 6, categoryName: "Herbs" },
    { name: "Thyme", price: 1300, quantity: 4, categoryName: "Herbs" },
    { name: "Aloe Vera", price: 400, quantity: 26, categoryName: "Succulents" },
    { name: "Daisy", price: 590, quantity: 12, categoryName: "Flowers" },
    { name: "Azalea", price: 1600, quantity: 5, categoryName: "Shrubs" },
  ];

  async ensureBaselineDataSeeded() {
    console.log("🌱 Ensuring baseline data is seeded...");
    const adminToken = await this.authHelper.loginAdmin();
    this.apiHelper.setAuthToken(adminToken);

    // 1. Check/Seed Categories
    const allCatsRes = await this.apiHelper.get("/api/categories?size=1000");
    const categories = await this.apiHelper.getResponseBody(allCatsRes);
    const catsList = Array.isArray(categories)
      ? categories
      : categories.content || [];

    const subCategoryNames = ["Flowers", "Succulents", "Shrubs", "Herbs"];
    const hasBaselineCategories = DataSeeder.SEED_CATEGORIES.every(
      (seedCat) => {
        const found = catsList.find((c: any) => c.name === seedCat.name);
        if (!found) return false;
        if (subCategoryNames.includes(seedCat.name)) {
          return found.parentName && found.parentName !== "-";
        }
        return true;
      },
    );

    if (!hasBaselineCategories) {
      console.log("⚠ Baseline categories missing or incomplete, seeding...");
      await this.seedBaselineCategories(adminToken, catsList);
    } else {
      console.log("✓ Baseline categories already present.");
    }

    // 2. Check/Seed Plants
    const allPlantsRes = await this.apiHelper.get("/api/plants?size=1000");
    const plants = await this.apiHelper.getResponseBody(allPlantsRes);
    const plantsList = Array.isArray(plants) ? plants : plants.content || [];

    const seedPlantNames = DataSeeder.SEED_PLANTS.map((p) => p.name);
    const hasBaselinePlants = plantsList.some((p: any) =>
      seedPlantNames.includes(p.name),
    );

    if (!hasBaselinePlants) {
      console.log("⚠ Baseline plants missing, seeding...");
      await this.seedBaselinePlants(adminToken);
    } else {
      console.log("✓ Baseline plants already present.");
    }
  }

  private async seedBaselineCategories(token: string, existingCats: any[]) {
    const subCategoryNames = ["Flowers", "Succulents", "Shrubs", "Herbs"];
    for (const name of subCategoryNames) {
      const invalid = existingCats.find(
        (c: any) => c.name === name && (!c.parentName || c.parentName === "-"),
      );
      if (invalid) {
        await this.apiHelper.delete(`/api/categories/${invalid.id}`);
      }
    }

    const mainCategories = ["Indoor", "Outdoor"];
    const createdIds: Record<string, string> = {};

    for (const name of mainCategories) {
      let cat = existingCats.find((c: any) => c.name === name);
      if (!cat) {
        const res = await this.apiHelper.post("/api/categories", { name });
        cat = await this.apiHelper.getResponseBody(res);
      }
      createdIds[name] = cat.id;
    }

    const subCategories = [
      { name: "Flowers", parent: "Indoor" },
      { name: "Succulents", parent: "Indoor" },
      { name: "Shrubs", parent: "Outdoor" },
      { name: "Herbs", parent: "Outdoor" },
    ];

    for (const sub of subCategories) {
      const exists = existingCats.find(
        (c: any) => c.name === sub.name && c.parentName === sub.parent,
      );
      if (!exists) {
        await this.apiHelper.post("/api/categories", {
          name: sub.name,
          parent: { id: createdIds[sub.parent] },
        });
      }
    }
  }

  private async seedBaselinePlants(token: string) {
    const allCatsRes = await this.apiHelper.get("/api/categories?size=1000");
    const categories = await this.apiHelper.getResponseBody(allCatsRes);
    const catsList = Array.isArray(categories)
      ? categories
      : categories.content || [];

    for (const plant of DataSeeder.SEED_PLANTS) {
      const category = catsList.find((c: any) => c.name === plant.categoryName);
      if (category && category.parentName && category.parentName !== "-") {
        await this.apiHelper.post(`/api/plants/category/${category.id}`, {
          name: plant.name,
          price: plant.price,
          quantity: plant.quantity,
          category: {
            id: category.id,
            name: category.name,
            parent: {
              id: catsList.find((c: any) => c.name === category.parentName).id,
              name: category.parentName,
            },
          },
        });
      }
    }
  }
}
