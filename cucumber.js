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
    require: ["src/test/utils/hooks.ts", "src/test/steps/categories_cm1.steps.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress"],
    paths: ["src/test/features/categories_cm1.feature"],
    publishQuiet: true,
    timeout: 60000,
  },
};
