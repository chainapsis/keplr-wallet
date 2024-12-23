module.exports = {
  extends: ["plugin:@docusaurus/recommended", "prettier"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "import/no-default-export": "off",
    "import/no-unresolved": "off",
  },
  overrides: [
    {
      files: ["*.css", "*.scss", "*.sass"],
      rules: {}, // No rules applied for CSS/SCSS/SASS files
    },
  ],
};
