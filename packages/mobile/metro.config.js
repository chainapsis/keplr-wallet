/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const getWorkspaces = require('get-yarn-workspaces');
const path = require('path');

const workspaces = getWorkspaces(__dirname);

// Add additional Yarn workspace package roots to the module map
// https://bit.ly/2LHHTP0
const watchFolders = [
  path.resolve(__dirname, '../..', 'node_modules'),
  ...workspaces.filter((workspaceDir) => {
    return !(workspaceDir === __dirname);
  }),
];

module.exports = {
  projectRoot: path.resolve(__dirname, '.'),
  watchFolders,
  resolver: {
    extraNodeModules: {
      crypto: path.resolve(__dirname, 'node_modules/react-native-crypto'),
      stream: path.resolve(__dirname, '../../node_modules/stream-browserify'),
      string_decoder: path.resolve(
        __dirname,
        '../../node_modules/string_decoder',
      ),
      path: path.resolve(__dirname, '../../node_modules/path-browserify'),
      http: path.resolve(__dirname, '../../node_modules/http-browserify'),
      https: path.resolve(__dirname, '../../node_modules/https-browserify'),
      os: path.resolve(__dirname, '../../node_modules/os-browserify'),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
