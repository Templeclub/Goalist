import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import i18next from 'eslint-plugin-i18next'
import storybook from 'eslint-plugin-storybook'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs['flat/recommended'],

  // No hard-coded user-facing text in UI code: everything goes through next-intl.
  {
    files: ['src/app/**/*.tsx', 'src/components/**/*.tsx', 'src/features/**/*.tsx'],
    ignores: ['**/*.stories.tsx', '**/*.test.tsx'],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-text-only',
          'should-validate-template': true,
        },
      ],
    },
  },

  // The service-role client may only be used inside src/server/admin.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/server/admin/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/server/admin', '@/server/admin/*', '**/server/admin/*'],
              message: 'The admin (service_role) module is restricted to src/server/admin.',
            },
          ],
        },
      ],
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'storybook-static/**',
    'playwright-report/**',
    'test-results/**',
    'docs/mockups/**',
    'src/lib/supabase/database.types.ts',
  ]),
])

export default eslintConfig
