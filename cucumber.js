module.exports = {
  default: {
    require: ["src/test/steps/**/*.ts", "src/test/utils/hooks.ts"],
    format: ["progress", "allure-cucumberjs"],
    paths: ["src/test/features/**/*.feature"],
    publishQuiet: true,
  },
};
