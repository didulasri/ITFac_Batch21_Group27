module.exports = {
  default: {
    require: ["src/test/steps/**/*.ts", "src/test/utils/hooks.ts"],
    requireModule: ["ts-node/register"],
    format: [
      "progress",
      // Correct allure formatter configuration
      // ["allure-cucumberjs", "./allure-results"],
    ],
    paths: ["src/test/features/**/*.feature"],
    publishQuiet: true,
    timeout: 60000,
  },
  categories: {
    require: [
      "src/test/utils/hooks.ts",
      "src/test/steps/common.steps.ts",
      "src/test/steps/categories_cm1.steps.ts",
    ],
    requireModule: ["ts-node/register"],
    format: ["progress"],
    paths: ["src/test/features/categories_cm1.feature"],
    publishQuiet: true,
    timeout: 60000,
  },

  "sales-api": {
    require: ["src/test/utils/hooks.ts", "src/test/steps/sales_api.steps.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress"],
    paths: ["src/test/features/sales_api.feature"],
    publishQuiet: true,
    timeout: 60000,
  },
  categories_cm2: {
    require: [
      "src/test/utils/hooks.ts",
      "src/test/steps/common.steps.ts",
      "src/test/steps/categories_cm1.steps.ts",
      "src/test/steps/categories_cm2.steps.ts",
    ],
    requireModule: ["ts-node/register"],
    format: ["progress"],
    paths: ["src/test/features/categories_cm2.feature"],
    publishQuiet: true,
    timeout: 60000,
  },
  "api-categories-cm2": {
    require: [
      "src/test/utils/hooks.ts",
      "src/test/steps/categories_cm2_api.steps.ts",
    ],
    requireModule: ["ts-node/register"],
    format: ["progress"],
    paths: ["src/test/features/categories_cm2_api.feature"],
    publishQuiet: true,
    timeout: 60000,
  },
  "api-categories-cm1": {
    require: [
      "src/test/utils/hooks.ts",
      "src/test/steps/categories_cm1_api.steps.ts",
    ],
    requireModule: ["ts-node/register"],
    format: ["progress"],
    paths: ["src/test/features/categories_cm1_api.feature"],
    publishQuiet: true,
    timeout: 60000,
  },
};



