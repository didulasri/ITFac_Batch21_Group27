import { APIRequestContext, request } from "@playwright/test";

export class ApiUtils {
  readonly baseUrl: string = "http://localhost:8080";
  readonly apiContext: APIRequestContext;

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  async post(endpoint: string, data?: object) {
    return await this.apiContext.post(`${this.baseUrl}${endpoint}`, { data });
  }

  async get(
    endpoint: string,
    params?: { [key: string]: string | number | boolean },
  ) {
    return await this.apiContext.get(`${this.baseUrl}${endpoint}`, { params });
  }

  async delete(endpoint: string) {
    return await this.apiContext.delete(`${this.baseUrl}${endpoint}`);
  }

  // Static helper to create data using a fresh context (Admin role)
  static async createPlant(
    name: string,
    price: number,
    stock: number,
  ): Promise<string> {
    const browserContext = await request.newContext();
    const api = new ApiUtils(browserContext);

    // 1. Login as Admin to get Token
    const loginRes = await api.post("/api/auth/login", {
      username: "admin",
      password: "admin123",
    });
    if (loginRes.status() !== 200) {
      console.log("Seeding failed: Admin login failed");
      return "";
    }
    const loginData = await loginRes.json();
    const token = loginData.token;

    // 2. Ensure Category Exists
    // Create a new context with Auth header for subsequent requests
    const authContext = await request.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    const authApi = new ApiUtils(authContext);

    let categoryId = 1;
    const catRes = await authApi.get("/api/categories");
    if (catRes.status() === 200) {
      const categories = await catRes.json();
      // Should be a Page or List? Swagger said Category response, but GetAll usually returns list or page.
      // Docs said "Category retrieved successfully" but checks "Get all categories" -> responses 200 Category?
      // Likely it returns an array or page content. Let's inspect safety.
      // If it's empty or error, we try to create.
      // Swagger says /api/categories returns "Category", possibly array or single?
      // /api/categories/main returns single?
      // Let's assume we might need to create if list is empty.
      // If we can't parse, we default to try creating one.
      if (Array.isArray(categories) && categories.length > 0) {
        categoryId = categories[0].id;
      } else if (
        categories.content &&
        Array.isArray(categories.content) &&
        categories.content.length > 0
      ) {
        categoryId = categories.content[0].id;
      } else {
        // Create Category
        const newCat = await authApi.post("/api/categories", {
          name: "General",
        });
        if (newCat.status() === 201) {
          const catBody = await newCat.json();
          categoryId = catBody.id;
        }
      }
    }

    // 3. Create Plant
    // Swagger: POST /api/plants/category/{categoryId}
    // Check if plant exists first?
    // Search by name to avoid duplicates if DB isn't wiped?
    // /api/plants/paged?name=...
    const searchRes = await authApi.get("/api/plants/paged", {
      name: name,
      page: 0,
      size: 100,
      sort: "id,desc",
    });
    if (searchRes.status() === 200) {
      const searchData = await searchRes.json();
      // ... same logic ...
      if (searchData.content && searchData.content.length > 0) {
        // Basic filtered check if backend ignores name filter
        const match = searchData.content.find(
          (p: any) => p.name.toLowerCase() === name.toLowerCase(),
        );
        if (match) return match.id;
        // If not exact match but name filter worked?
        // Let's assume if content returned, return first.
        return searchData.content[0].id;
      }
    }

    const response = await authApi.post(`/api/plants/category/${categoryId}`, {
      name: name,
      price: price,
      quantity: stock,
    });

    if (response.status() === 201) {
      const body = await response.json();
      return body.id;
    }

    if (response.status() === 400) {
      console.log(`Seed '${name}' 400 (likely duplicate). Fetching ID.`);
      return await ApiUtils.getPlantIdByName(name);
    }

    console.log(`Failed to seed plant '${name}'. Status: ${response.status()}`);
    return "";
  }

  static async getPlantIdByName(name: string): Promise<string> {
    const browserContext = await request.newContext();
    const api = new ApiUtils(browserContext);

    // Login
    const loginRes = await api.post("/api/auth/login", {
      username: "admin",
      password: "admin123",
    });
    if (loginRes.status() !== 200) return "";
    const token = (await loginRes.json()).token;

    const authContext = await request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    const authApi = new ApiUtils(authContext);

    const searchRes = await authApi.get("/api/plants/paged", {
      name: name,
      page: 0,
      size: 100,
    });
    if (searchRes.status() === 200) {
      const searchData = await searchRes.json();
      if (searchData.content && searchData.content.length > 0) {
        return searchData.content[0].id;
      }
    }
    return "";
  }
}
