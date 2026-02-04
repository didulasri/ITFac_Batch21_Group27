const { request } = require("@playwright/test");

(async () => {
  const context = await request.newContext({
    baseURL: "http://localhost:8080",
  });

  // 1. Login
  const loginRes = await context.post("/api/auth/login", {
    data: { username: "admin", password: "admin123" },
  });
  const token = (await loginRes.json()).token;
  console.log("Login successful, token obtained.");

  const api = await request.newContext({
    baseURL: "http://localhost:8080",
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });

  const plantName = "Sunflower";

  // 2. Search
  console.log(`Searching for ${plantName}...`);
  const searchRes = await api.get("/api/plants/paged", {
    params: { name: plantName, page: 0, size: 100 },
  });
  const searchData = await searchRes.json();
  console.log(`Search Status: ${searchRes.status()}`);
  console.log(
    `Search Results Count: ${searchData.content ? searchData.content.length : "N/A"}`,
  );
  if (searchData.content && searchData.content.length > 0) {
    console.log("Found:", searchData.content[0]);
  } else {
    console.log("Not found in first 100.");
  }

  // 3. Create if not found
  if (!searchData.content || searchData.content.length === 0) {
    console.log("Attempting create...");
    // Need category ID
    const catRes = await api.get("/api/categories");
    const categories = await catRes.json();
    let catId = categories.length > 0 ? categories[0].id : 1;
    if (categories.content && categories.content.length > 0)
      catId = categories.content[0].id;

    const createRes = await api.post(`/api/plants/category/${catId}`, {
      data: { name: plantName, price: 12, quantity: 50 },
    });
    console.log(`Create Status: ${createRes.status()}`);
    if (createRes.status() !== 201) {
      console.log("Create Body:", await createRes.text());
    } else {
      console.log("Created ID:", (await createRes.json()).id);
    }
  }
})();
