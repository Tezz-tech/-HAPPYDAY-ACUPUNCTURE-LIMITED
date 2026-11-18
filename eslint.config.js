import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/.react-router/**',
      '**/coverage/**',
      'web/public/**',
      'TODO_CLIENT.md',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['**/test/**/*.js', '**/*.test.js', 'e2e/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
];
