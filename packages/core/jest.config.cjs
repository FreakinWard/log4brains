const { pathsToModuleNameMapper } = require("ts-jest");
const base = require("../../jest.config.base");
const { compilerOptions } = require("./tsconfig");
const packageJson = require("./package");

// ESM-only dependencies, compiled to CommonJS for Jest
// TODO: remove when Node 22 is no longer supported (Jest loads them natively from Node 24.9)
const esmOnlyDependencies = [
  "chokidar",
  "readdirp",
  "globby",
  "@sindresorhus/merge-streams",
  "is-path-inside",
  "slash",
  "unicorn-magic"
];

module.exports = {
  ...base,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.m?js$": ["ts-jest", { tsconfig: { allowJs: true } }]
  },
  transformIgnorePatterns: [
    `/node_modules/(?!(${esmOnlyDependencies.join("|")})/)`
  ],
  displayName: packageJson.name,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/"
  })
};
