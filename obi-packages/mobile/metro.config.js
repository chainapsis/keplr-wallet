const exclusionList = require("metro-config/src/defaults/exclusionList");
const path = require("path");
const { getMetroTools } = require("react-native-monorepo-tools");

const monorepoMetroTools = getMetroTools();

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  watchFolders: monorepoMetroTools.watchFolders,
  resolver: {
    blockList: exclusionList([
      ...monorepoMetroTools.blockList,
      /obi-packages\/mobile\/node_modules\/(react|react-intl)\/.*/,
    ]),
    extraNodeModules: {
      ...monorepoMetroTools.extraNodeModules,
      crypto: require.resolve("react-native-fast-crypto"),
      react: path.resolve(__dirname, "../../node_modules/react"),
      stream: require.resolve("readable-stream"),
    },
  },
};
