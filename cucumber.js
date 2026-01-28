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
};
