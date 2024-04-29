const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');
const fs = require('fs');

// 참고: https://github.com/mmazzarolo/react-native-monorepo-tools

const currentPath = __dirname;
const rootPath = (() => {
  const i = currentPath.lastIndexOf('/apps/mobile');
  if (i < 0) {
    throw new Error('Could not find apps/mobile in path');
  }

  return currentPath.slice(0, i);
})();

const packages = (() => {
  const res = [];

  const dirs = fs.readdirSync(`${rootPath}/packages/`);
  for (const dir of dirs) {
    const stat = fs.statSync(`${rootPath}/packages/${dir}`);
    if (
      stat.isDirectory() &&
      fs.existsSync(`${rootPath}/packages/${dir}/package.json`)
    ) {
      res.push(`/packages/${dir}`);
    }
  }
  const dirs2 = fs.readdirSync(`${rootPath}/apps/`);
  for (const dir of dirs2) {
    if (dir === 'mobile') {
      // 당근 자기 자신은 무시한다.
      continue;
    }

    const stat = fs.statSync(`${rootPath}/apps/${dir}`);
    if (
      stat.isDirectory() &&
      fs.existsSync(`${rootPath}/apps/${dir}/package.json`)
    ) {
      res.push(`/apps/${dir}`);
    }
  }

  return res;
})();

// react와 같은 library는 여러 버전이 동시에 존재하면 오류가 난다.
// 근데 mobile package는 nohoist 옵션에 의해서 react와 같은 library를
// 본인의 node_modules에 가지고 있다.
// 하지만 다른 패키지들의 경우에는 react가 hoist되어서 root의 node_modules에 존재한다.
// 잠재적으로 다른 버전의 react들이 존재할 수 있기 때문에
// mobile에는 실제로는 본인의 node_modules의 library들이 아니라 root의 node_modules의 library들을 사용하게 한다.
// XXX: 각 package들이 버전 관리를 잘못해서 각 package들 밑에 node_modules가 생기면 이 경우는 처리하지 못한다.
//      근데 이 경우면 이미 extension에서도 문제가 생겼을 것이기 때문에 이러한 버전 관리는 알아서 잘 하도록 하자...
const shouldNohoistLibs = [
  'react-native',
  'react',
  'mobx',
  'mobx-utils',
  'mobx-react-lite',
  'buffer',
  '@gorhom',
];

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    rootPath + '/node_modules',
    ...(() => {
      const res = [];
      for (const pack of packages) {
        res.push(rootPath + pack);
      }
      return res;
    })(),
  ],
  resolver: {
    blockList: exclusionList(
      (() => {
        const res = [];
        for (const lib of shouldNohoistLibs) {
          res.push(new RegExp(`^${rootPath}\\/node_modules\\/${lib}\\/.*$`));
        }

        return res;
      })(),
    ),
    extraNodeModules: {
      crypto: path.resolve(
        __dirname,
        './node_modules/expo-standard-web-crypto',
      ),
      buffer: path.resolve(__dirname, './node_modules/buffer'),
      stream: path.resolve(__dirname, './node_modules/stream-browserify'),
      string_decoder: path.resolve(__dirname, './node_modules/string_decoder'),
      path: path.resolve(__dirname, './node_modules/path-browserify'),
      http: path.resolve(__dirname, './node_modules/http-browserify'),
      https: path.resolve(__dirname, './node_modules/https-browserify'),
      os: path.resolve(__dirname, './node_modules/os-browserify'),
      ...(() => {
        const res = {};
        for (const lib of shouldNohoistLibs) {
          res[lib] = `${rootPath}/apps/mobile/node_modules/${lib}`;
        }
        return res;
      })(),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
