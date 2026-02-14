import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import configPrettier from 'eslint-config-prettier'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'

export default [
  { ignores: ['node_modules/**', 'out/**', 'release/**', '**/*.min.js', 'scripts/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  configPrettier,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
    },
    rules: {
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      }
    },
    rules: {
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'vue/multi-word-component-names': 'off',
      'vue/attributes-order': 'warn'
    }
  }
]
