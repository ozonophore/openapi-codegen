import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { ensureCodegenTempDir, getCodegenTempDir } from './codegenTempDir';
import { fileSystemHelpers } from './fileSystemHelpers';
import { resolveHelper } from './pathHelpers';

/** Options for {@link prepareTempEslintConfig}. */
export interface PrepareTempEslintConfigOptions {
    /** Path to the host project's ESLint config file. */
    eslintConfigPath: string;
    /** Absolute path to the temporary tsconfig from {@link prepareTempTsConfig}. */
    tempTsconfigPath: string;
    /** Project root (defaults to process.cwd()). */
    cwd?: string;
}

/**
 * Writes an ESLint flat-config wrapper that imports the host config and points type-aware rules
 * at the temporary tsconfig.
 *
 * @param options - Host ESLint config path and temporary tsconfig path.
 * @returns Absolute path to .openapi-codegen/eslint.config.codegen.mjs.
 */
export async function prepareTempEslintConfig(options: PrepareTempEslintConfigOptions): Promise<string> {
    const cwd = options.cwd ?? process.cwd();
    await ensureCodegenTempDir(cwd);
    const absoluteUserConfig = resolveHelper(cwd, options.eslintConfigPath);
    const userConfigUrl = pathToFileURL(absoluteUserConfig).href;
    const tsconfigFileName = path.basename(options.tempTsconfigPath);

    const wrapperPath = path.join(getCodegenTempDir(cwd), 'eslint.config.codegen.mjs');
    const content = `import userConfig from ${JSON.stringify(userConfigUrl)};
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempTsconfigPath = path.join(__dirname, ${JSON.stringify(tsconfigFileName)});

function normalizeConfigs(config) {
    if (!config) {
        return [];
    }
    return Array.isArray(config) ? config : [config];
}

export default [
    ...normalizeConfigs(userConfig),
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                project: tempTsconfigPath,
                tsconfigRootDir: ${JSON.stringify(cwd)},
            },
        },
    },
];
`;

    await fileSystemHelpers.writeFile(wrapperPath, content);
    return wrapperPath;
}
