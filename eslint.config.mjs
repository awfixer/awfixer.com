import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import tailwind from 'eslint-plugin-tailwindcss'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...tailwind.configs['flat/recommended'],
  {
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      // Code quality rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-duplicate-imports': 'error',

      // React specific rules
      'react/jsx-key': 'error',
      'react/no-array-index-key': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',

      // Tailwind CSS rules
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/enforces-negative-arbitrary-values': 'warn',
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/no-arbitrary-value': 'off', // Allow arbitrary values for flexibility
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          // Allow Payload CMS specific classes and other necessary custom classes
          whitelist: [
            'admin-bar',
            'before-dashboard',
            'payload-richtext',
            'prose',
            'dark:prose-invert',
            'sr-only',
            'required',
            'not-prose',
          ],
        },
      ],
      'tailwindcss/no-contradicting-classname': 'error',
    },
  },
  {
    ignores: [
      '.next/',
      'node_modules/',
      'dist/',
      'build/',
      '.husky/',
      'src/payload-types.ts',
      'src/migrations/',
      'src/app/(payload)/admin/importMap.js',
      'src/app/(payload)/custom.scss',
    ],
  },
]

export default eslintConfig
