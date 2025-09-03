// @ts-check

import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import jest from 'eslint-plugin-jest'
import stylistic from '@stylistic/eslint-plugin'
import typescript from 'typescript-eslint'

// noinspection JSCheckFunctionSignatures
export default defineConfig(
  stylistic.configs.recommended,

  eslint.configs.recommended,

  typescript.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  typescript.configs.stylisticTypeChecked,
  {
    files: ['**/*.(c|m)?js'],
    extends: [typescript.configs.disableTypeChecked],
  },

  jest.configs['flat/recommended'],
)
