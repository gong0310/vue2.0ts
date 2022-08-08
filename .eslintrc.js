module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
    commonjs: true,
    jest: true,
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
  ],
  globals: {
    Vue: 'readonly',
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      legacyDecorators: true,
      jsx: true,
    },
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
    vueFeatures: {
      filter: true,
      interpolationAsNonHTML: false,
    },
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    'no-console': 'warn',
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 5,
        },
        multiline: {
          max: 1,
          allowFirstLine: false,
        },
      },
    ],
    'max-len': ['error', { code: 120 }],
    "@typescript-eslint/no-explicit-any":["off"],
    "@typescript-eslint/explicit-module-boundary-types" : "off" 
  },
};
