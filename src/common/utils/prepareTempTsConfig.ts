import path from 'node:path';

import ts from 'typescript';

import { ensureCodegenTempDir, getCodegenTempDir } from './codegenTempDir';
import { fileSystemHelpers } from './fileSystemHelpers';
import { resolveHelper } from './pathHelpers';

/** Parsed CompilerOptions may include fields that are not valid in tsconfig.json. */
const INTERNAL_COMPILER_OPTION_KEYS = new Set<string>(['configFilePath']);

function isWritableCompilerOptionKey(key: string): boolean {
    return !INTERNAL_COMPILER_OPTION_KEYS.has(key);
}

/** Maps parsed numeric enum values back to tsconfig.json string literals. */
function serializeEnumCompilerOption(key: string, value: number): string | number {
    switch (key) {
        case 'target':
            return ts.ScriptTarget[value] ?? value;
        case 'module':
            return ts.ModuleKind[value] ?? value;
        case 'moduleResolution':
            return ts.ModuleResolutionKind[value] ?? value;
        case 'jsx':
            return ts.JsxEmit[value] ?? value;
        case 'newLine':
            return ts.NewLineKind[value] ?? value;
        default:
            return value;
    }
}

/** Maps parsed CompilerOptions to a JSON-serializable tsconfig fragment. */
function compilerOptionsToJson(options: ts.CompilerOptions): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    const source = options as Record<string, unknown>;

    for (const [key, value] of Object.entries(source)) {
        if (value === undefined || !isWritableCompilerOptionKey(key)) {
            continue;
        }

        if (typeof value === 'number') {
            json[key] = serializeEnumCompilerOption(key, value);
            continue;
        }

        json[key] = value;
    }

    return json;
}

/**
 * Builds JSON-safe compilerOptions: parsed values (extends resolved) plus raw literals
 * from the base file (preserves lib/types paths as written in tsconfig.json).
 */
function mergeCompilerOptionsForJson(rawCompilerOptions: ts.CompilerOptions | undefined, parsedOptions: ts.CompilerOptions): Record<string, unknown> {
    const json = compilerOptionsToJson(parsedOptions);
    const rawSource = rawCompilerOptions as Record<string, unknown> | undefined;

    if (rawSource) {
        for (const [key, value] of Object.entries(rawSource)) {
            if (value !== undefined && isWritableCompilerOptionKey(key)) {
                json[key] = value;
            }
        }
    }

    return json;
}

/** Options for {@link prepareTempTsConfig}. */
export interface PrepareTempTsConfigOptions {
    /** Path to the host project's base tsconfig.json. */
    baseTsconfigPath: string;
    /**
     * Narrow include globs for generated output only (e.g. ./generated/models/.../*.ts).
     * Replaces the base tsconfig include; the base include is not merged.
     */
    includeGlobs: string[];
    /** Project root (defaults to process.cwd()). */
    cwd?: string;
}

/**
 * Builds a temporary tsconfig for type-aware ESLint without loading the whole repository.
 *
 * Reads compilerOptions from the base tsconfig, then writes .openapi-codegen/tsconfig.eslint.json
 * with a replaced include, noEmit, skipLibCheck, and incremental: false.
 *
 * @param options - Base tsconfig path and narrow include globs.
 * @returns Absolute path to the written temporary tsconfig file.
 */
export async function prepareTempTsConfig(options: PrepareTempTsConfigOptions): Promise<string> {
    const cwd = options.cwd ?? process.cwd();
    const absoluteBase = resolveHelper(cwd, options.baseTsconfigPath);
    const baseDir = path.dirname(absoluteBase);

    const configFile = ts.readConfigFile(absoluteBase, ts.sys.readFile);
    if (configFile.error) {
        const message = ts.formatDiagnostic(configFile.error, {
            getCanonicalFileName: f => f,
            getCurrentDirectory: () => cwd,
            getNewLine: () => '\n',
        });
        throw new Error(`Failed to read tsconfig at "${absoluteBase}": ${message}`);
    }

    const parsedBase = ts.parseJsonConfigFileContent(configFile.config, ts.sys, baseDir, undefined, absoluteBase);

    const include = options.includeGlobs.length > 0 ? options.includeGlobs.map(glob => (path.isAbsolute(glob) ? glob : path.join(cwd, glob))) : ['**/*.ts'];

    const rawCompilerOptions = configFile.config.compilerOptions as ts.CompilerOptions | undefined;

    const tempConfig = {
        compilerOptions: {
            ...mergeCompilerOptionsForJson(rawCompilerOptions, parsedBase.options),
            noEmit: true,
            skipLibCheck: true,
            incremental: false,
        },
        include,
        exclude: ['node_modules', '**/node_modules/**'],
    };

    await ensureCodegenTempDir(cwd);
    const tempPath = path.join(getCodegenTempDir(cwd), 'tsconfig.eslint.json');
    await fileSystemHelpers.writeFile(tempPath, `${JSON.stringify(tempConfig, null, 2)}\n`);
    return tempPath;
}
