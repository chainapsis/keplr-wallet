module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['scripts/BleTransport.js'],
  rules: {
    'react-native/no-inline-styles': 'off',
    'dot-notation': 'off',
    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-shadow': 'off',
  },
};
