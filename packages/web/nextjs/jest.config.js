const nextJest = require("next/jest");
const packageJson = require("../package.json");

// Compiles the tests with the same SWC configuration as the Next.js app (instead of ts-jest)
const createJestConfig = nextJest({ dir: __dirname });

module.exports = createJestConfig({
  testEnvironment: "jsdom", // components are rendered with Testing Library
  displayName: packageJson.name
});
