module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
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
          'KEPLR_EXT_COINGECKO_ENDPOINT',
          'KEPLR_EXT_COINGECKO_GETPRICE',
        ],
      },
    ],
  ],
};
