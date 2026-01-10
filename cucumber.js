module.exports = {
  default: {
    require: ["steps/**/*.ts", "utils/hooks.ts"],
    format: ["progress", "allure-cucumberjs"],
    paths: ["features/**/*.feature"],
    publishQuiet: true,
  },
};
