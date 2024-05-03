/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

/* eslint-disable */

const { getDefaultConfig } = require("metro-config");
const blacklist = require("metro-config/src/defaults/exclusionList");
const getWorkspaces = require("get-yarn-workspaces");
const path = require("path");

const workspaces = getWorkspaces(__dirname);

// Add additional Yarn workspace package roots to the module map
// https://bit.ly/2LHHTP0
const watchFolders = [
  path.resolve(__dirname, "../..", "node_modules"),
  ...workspaces.filter((workspaceDir) => {
    return !(workspaceDir === __dirname);
  }),
];

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    projectRoot: path.resolve(__dirname, "."),
    watchFolders,
    resolver: {
      // For react-native-svg-transformer
      assetExts: assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...sourceExts, "svg"],
      // To prevent that multiple react instances exist,
      // add the react in this package to the blacklist,
      // and use the only react in the root project.
      blacklistRE: blacklist([/packages\/mobile\/node_modules\/react\/.*/]),
      extraNodeModules: {
        components: path.resolve(__dirname, "./src/components"),
        navigation: path.resolve(__dirname, "./src/navigation"),
        screens: path.resolve(__dirname, "./src/screens"),
        hooks: path.resolve(__dirname, "./src/hooks"),
        assets: path.resolve(__dirname, "./src/assets"),
        styles: path.resolve(__dirname, "./src/styles"),
        modals: path.resolve(__dirname, "./src/modals"),
        providers: path.resolve(__dirname, "./src/providers"),
        stores: path.resolve(__dirname, "./src/stores"),
        utils: path.resolve(__dirname, "./src/utils"),
        crypto: path.resolve(__dirname, "./node_modules/react-native-crypto-polyfill"),
        buffer: path.resolve(__dirname, "../../node_modules/buffer"),
        stream: path.resolve(__dirname, "../../node_modules/stream-browserify"),
        string_decoder: path.resolve(__dirname, "../../node_modules/string_decoder"),
        path: path.resolve(__dirname, "../../node_modules/path-browserify"),
        http: path.resolve(__dirname, "../../node_modules/http-browserify"),
        https: path.resolve(__dirname, "../../node_modules/https-browserify"),
        os: path.resolve(__dirname, "../../node_modules/os-browserify"),
      },
    },
    transformer: {
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
  };
})();
