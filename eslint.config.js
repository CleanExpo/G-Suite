/**
 * G-Pilot Unified Google TypeScript Style (GTS) Configuration
 * Built for ESLint v9 (Flat Config) & Next.js compatibility.
 */
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');
const pluginN = require('eslint-plugin-n');
const pluginPrettier = require('eslint-plugin-prettier');
const globals = require('globals');
const nextPlugin = require('@next/eslint-plugin-next');

module.exports = [
  eslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      n: pluginN,
      prettier: pluginPrettier,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'block-scoped-var': 'error',
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eol-last': 'error',
      'prefer-arrow-callback': 'error',
      'no-trailing-spaces': 'error',
      quotes: ['warn', 'single', { avoidEscape: true }],
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@next/next': nextPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'n/no-missing-import': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
      'public/',
      '*.config.js',
      '*.config.ts',
      'test-db.js',
      'sweep-db.js',
      'test-prisma.ts'
    ],
  },
];
