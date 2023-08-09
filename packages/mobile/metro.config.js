const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: exclusionList(
      (() => {
        // react와 같은 library는 여러 버전이 동시에 존재하면 오류가 난다.
        // 근데 mobile package는 nohoist 옵션에 의해서 react와 같은 library를
        // 본인의 node_modules에 가지고 있다.
        // 하지만 다른 패키지들의 경우에는 react가 hoist되어서 root의 node_modules에 존재한다.
        // 잠재적으로 다른 버전의 react들이 존재할 수 있기 때문에
        // mobile에는 root의 아래 library들을 무시하고 본인의 node_modules 밑의 library를 사용하도록 강제한다.
        // XXX: 밑의 구현은 심플하게 root의 library들만 무시하게 한다.
        //      각 package들이 버전 관리를 잘못해서 각 package들 밑에 node_modules가 생기면 이 경우는 처리하지 못한다.
        //      근데 이 경우면 이미 extension에서도 문제가 생겼을 것이기 때문에 이러한 버전 관리는 알아서 잘 하도록 하자...
        const shouldNohoistLibs = [
          'react',
          'react-is',
          'mobx',
          'mobx-utils',
          'mobx-react-lite',
        ];

        const currentPath = __dirname;
        const rootPath = (() => {
          const i = currentPath.lastIndexOf('/packages/mobile');
          if (i < 0) {
            throw new Error('Could not find packages/mobile in path');
          }

          return currentPath.slice(0, i);
        })();

        const res = [];
        for (const lib of shouldNohoistLibs) {
          res.push(new RegExp(`^${rootPath}\\/node_modules\\/${lib}\\/.*$`));
        }

        return res;
      })(),
    ),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
