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
}
