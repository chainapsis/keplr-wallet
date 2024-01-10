const path = require('path');
const fs = require('fs');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          ...(() => {
            const p = path.resolve(
              __dirname,
              './src/keplr-wallet-mobile-private/index.ts',
            );

            if (fs.existsSync(p)) {
              return {
                'keplr-wallet-mobile-private': path.resolve(
                  __dirname,
                  './src/keplr-wallet-mobile-private/index.ts',
                ),
              };
            }

            return {};
          })(),
        },
      },
    ],
    'react-native-reanimated/plugin',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    [
      'transform-inline-environment-variables',
      {
        include: [
          'KEPLR_EXT_ETHEREUM_ENDPOINT',
          'KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN',
          'KEPLR_EXT_ANALYTICS_API_URL',
          'KEPLR_EXT_COINGECKO_ENDPOINT',
          'KEPLR_EXT_COINGECKO_GETPRICE',
          'KEPLR_EXT_TRANSAK_API_KEY',
          'KEPLR_EXT_MOONPAY_API_KEY',
          'KEPLR_EXT_KADO_API_KEY',
          'KEPLR_EXT_CHAIN_REGISTRY_URL',
          'WC_PROJECT_ID',
        ],
      },
    ],
  ],
};
