import path from 'node:path';

import { fileSystemHelpers } from './fileSystemHelpers';

/** Directory name under the project root for temporary codegen configs. */
const TEMP_DIR_NAME = '.openapi-codegen';

/**
 * Returns the absolute path to the temporary codegen directory.
 *
 * @param cwd - Project root (defaults to process.cwd()).
 */
export function getCodegenTempDir(cwd: string = process.cwd()): string {
    return path.join(cwd, TEMP_DIR_NAME);
}

/**
 * Creates the temporary codegen directory if it does not exist.
 *
 * @param cwd - Project root (defaults to process.cwd()).
 * @returns Absolute path to .openapi-codegen.
 */
export async function ensureCodegenTempDir(cwd: string = process.cwd()): Promise<string> {
    const dir = getCodegenTempDir(cwd);
    await fileSystemHelpers.mkdir(dir);
    return dir;
}

/**
 * Recursively removes the temporary codegen directory.
 *
 * @param cwd - Project root (defaults to process.cwd()).
 */
export async function cleanupCodegenTempDir(cwd: string = process.cwd()): Promise<void> {
    const dir = getCodegenTempDir(cwd);
    if (await fileSystemHelpers.exists(dir)) {
        await fileSystemHelpers.rmdir(dir);
    }
}
