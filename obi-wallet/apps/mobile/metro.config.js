const { withNxMetro } = require("@nrwl/react-native");
const { getDefaultConfig } = require("metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");
const path = require("path");

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return withNxMetro(
    {
      transformer: {
        getTransformOptions: async () => ({
          transform: {
            experimentalImportSupport: false,
            inlineRequires: true,
          },
        }),
        babelTransformerPath: require.resolve("react-native-svg-transformer"),
      },
      resolver: {
        assetExts: assetExts.filter((ext) => ext !== "svg"),
        sourceExts: [...sourceExts, "svg"],
        resolverMainFields: ["sbmodern", "browser", "main"],
        blockList: exclusionList([/\.\/dist\/.*/, /\/packages\/mobile\/.*/]),
        extraNodeModules: {
          buffer: require.resolve("buffer/"),
          crypto: require.resolve("react-native-crypto"),
          fs: require.resolve("react-native-level-fs"),
          os: require.resolve("os-browserify"),
          path: require.resolve("path-browserify"),
          process: require.resolve("process"),
          stream: require.resolve("stream-browserify"),
        },
      },
    },
    {
      // Change this to true to see debugging info.
      // Useful if you have issues resolving modules
      debug: false,
      // all the file extensions used for imports other than 'ts', 'tsx', 'js', 'jsx', 'json'
      extensions: [],
      // the project root to start the metro server
      projectRoot: __dirname,
      // Specify folders to watch, in addition to Nx defaults (workspace libraries and node_modules)
      watchFolders: [path.resolve(__dirname, "../../../packages")],
    }
  );
})();
