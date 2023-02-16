module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    ["@babel/plugin-transform-flow-strip-types"],
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    ["react-native-reanimated/plugin"],
    [
      "transform-inline-environment-variables",
      {
        include: [
          "WC_PROJECT_ID",
          "KEPLR_EXT_ANALYTICS_API_URL",
          "KEPLR_EXT_ANALYTICS_API_AUTH_TOKEN",
        ],
      },
    ],
  ],
};
