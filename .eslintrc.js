module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'airbnb-typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false, classes: false, variables: false, typedefs: true,
      },
    ],
    'react/destructuring-assignment': 'off',
    'max-len': ['error', { code: 120 }],
    'react/require-default-props': 'off',
    'operator-linebreak': ['error', 'after'],
    'react/function-component-definition': 'off',
    'no-mixed-operators': 'off',
  },
};
