const config = require("../../.eslintrc");

module.exports = {
  ...config,
  ...{
    extends: ["@react-native-community", ...config.extends],
  },
};
