module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "prettier",
    "plugin:import/typescript",
  ],
  plugins: ["react-hooks", "unicorn", "import", "unused-imports"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "react/prop-types": "off",
    "react/self-closing-comp": "error",
    "react/jsx-fragments": ["error", "element"],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-loss-of-precision": "off",
    "@typescript-eslint/camelcase": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.spec.ts",
          "**/*.spec.js",
          "**/*.test.ts",
          "**/*.test.js",
          "**/webpack.config.js",
          "**/*.stories.tsx",
        ],
      },
    ],
    "import/no-default-export": "error",
    "import/no-useless-path-segments": "error",
    "unused-imports/no-unused-imports": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.stories.tsx"],
      rules: {
        "import/no-default-export": "off",
      },
    },
    {
      // Make options for codes and MDX files separate
      files: ["**/*.stories.mdx"],
      extends: ["plugin:mdx/recommended"],
      plugins: [],
      rules: {
        "import/no-extraneous-dependencies": "off",
      },
      settings: {
        "mdx/code-blocks": true,
      },
    },
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
};
