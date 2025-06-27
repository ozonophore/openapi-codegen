import path from "node:path";
import { fileURLToPath } from "node:url";

import {fixupConfigRules, fixupPluginRules} from '@eslint/compat'
import {FlatCompat} from '@eslint/eslintrc'
import js from "@eslint/js";
import pluginTypescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { defineConfig } from "eslint/config";
import pluginJsdoc from "eslint-plugin-jsdoc";
// import pluginLodash from 'eslint-plugin-lodash'
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort"
import globals from "globals";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,                  // optional; default: process.cwd()
    resolvePluginsRelativeTo: __dirname,       // optional
    recommendedConfig: js.configs.recommended, // optional unless you're using "eslint:recommended"
    allConfig: js.configs.all,                 // optional unless you're using "eslint:all"
})

export default defineConfig([
    {
        ignores: ['*.js', 'node_modules', 'dist', 'bin', 'src/templatesCompiled']
    },

    ...fixupConfigRules(
        compat.extends(
            'eslint:recommended',
            'plugin:@typescript-eslint/eslint-recommended',
            'plugin:@typescript-eslint/recommended',
            // "plugin:lodash/recommended",
            'prettier',
        )
    ),
    {
        plugins: {
            '@typescript-eslint': fixupPluginRules(pluginTypescriptEslint),
            jsdoc: fixupPluginRules(pluginJsdoc),
            "simple-import-sort": fixupPluginRules(pluginSimpleImportSort),
            // lodash: fixupPluginRules(pluginLodash),
        },
        languageOptions: {
            globals: { 
                ...globals.node,
                Atomics: 'readonly', 
                SharedArrayBuffer: 'readonly',
                reporter: 'readonly',
                NodeJS: true,
            },
            parser: tsParser,
            ecmaVersion: 2020,
            sourceType: 'module',
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "sort-imports": "off",
            "import/order": "off",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "no-useless-escape": ["error", { "allowRegexCharacters": ["-"] }]
        }
    }
]);
