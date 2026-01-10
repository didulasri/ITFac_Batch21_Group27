import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 30000,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    baseURL: "http://localhost:8080",
    ignoreHTTPSErrors: true,
  },
  reporter: [["list"], ["allure-playwright"]],
};

export default config;
