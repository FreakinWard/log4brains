const base = require("../../../jest.config.base");
const packageJson = require("./package");

module.exports = {
  ...base,
  displayName: packageJson.name,
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  }
};
