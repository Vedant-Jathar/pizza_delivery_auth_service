// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: [
      'node_modules',
      'dist',
      'eslint.config.mjs',
      'jest.config.js',
      '*.spec.ts',
      'tests/',
      'coverage/**',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // "no-console": "error",
      'dot-notation': 'error',
    },
  },
)
