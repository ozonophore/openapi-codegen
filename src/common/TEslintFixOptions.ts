import { TRawOptions } from './TRawOptions';

/**
 * Top-level ESLint fix options read once from TRawOptions.
 * Not propagated into per-item TFlatOptions.
 * Batch ESLint runs when both paths are set.
 */
export type TEslintFixOptions = {
    /** Path to the host project's tsconfig.json. */
    tsconfigPath?: string;
    /** Path to the host project's ESLint config. */
    eslintConfigPath?: string;
};

/**
 * Extracts ESLint fix settings from raw generator options (root config only).
 *
 * @param raw - Validated unified options before per-item normalization.
 * @returns Resolved ESLint fix options for OpenApiClient.
 */
export function extractEslintFixOptions(raw: TRawOptions): TEslintFixOptions {
    return {
        tsconfigPath: raw.tsconfigPath,
        eslintConfigPath: raw.eslintConfigPath,
    };
}
