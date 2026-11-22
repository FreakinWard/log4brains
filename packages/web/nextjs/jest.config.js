const nextJest = require("next/jest");
const packageJson = require("../package.json");

// Compiles the tests with the same SWC configuration as the Next.js app (instead of ts-jest)
const createJestConfig = nextJest({ dir: __dirname });

// ESM-only dependencies, compiled to CommonJS for Jest
// TODO: remove when Node 22 is no longer supported (Jest loads them natively from Node 24.9)
const esmOnlyDependencies = ["copy-text-to-clipboard"];

module.exports = async () => {
  const config = await createJestConfig({
    testEnvironment: "jsdom", // components are rendered with Testing Library
    displayName: packageJson.name
  })();
  return {
    ...config,
    // Adds them to the node_modules packages that next/jest compiles (transpilePackages and parts of Next.js)
    transformIgnorePatterns: config.transformIgnorePatterns.map((pattern) =>
      pattern.replace(
        "/node_modules/(?!.pnpm)(?!(",
        `/node_modules/(?!.pnpm)(?!(${esmOnlyDependencies.join("|")}|`
      )
    )
  };
};
