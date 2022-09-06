module.exports = {
  assets: [
    "./src/assets/fonts/Inter",
    "../../libs/injected-provider/dist/injected-provider.js",
  ],
  dependencies: {
    "react-native-device-crypto": {
      platforms: {
        android: null,
      },
    },
  },
  project: {
    ios: {},
    android: {},
  },
};
