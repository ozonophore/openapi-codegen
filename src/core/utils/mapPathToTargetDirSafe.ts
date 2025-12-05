import { relative } from 'path';

import { findCommonParent } from './findCommonParent';
import { getRelativeModelPath } from './getRelativeModelPath';
import { resolve } from './pathHelpers';

/**
 * Safely muppit the path from SourceDir → targetDir
 * Works even if the file is outside SourceDir, but in a common parent
 * @param filePath
 * @param sourceDir
 * @param targetDir
 * @returns
 */
export function mapPathToTargetDirSafe(filePath: string, sourceDir: string, targetDir: string): string {
    const pathSep = '/';

    const absFile = resolve(filePath);
    const absSource = resolve(sourceDir);
    const absTarget = resolve(targetDir);

    const sourceWithSep = absSource.endsWith(pathSep) ? absSource : absSource + pathSep;

    // 1. The file inside SourceDir → mapim as usual
    if (absFile.startsWith(sourceWithSep)) {
        const rel = relative(absSource, absFile);
        return resolve(absTarget, rel);
    }

    // 2. The file is outside SourceDir, but in a common parent
    const commonParent = findCommonParent(absSource, absFile);
    if (commonParent) {
        // Path from commonParent → file
        const fileRelToCommon = relative(commonParent, absFile);

        // Path from targetDir → commonParent
        const targetToCommon = relative(absTarget, commonParent);
        if (targetToCommon.includes('..')) {
            // targetDir is higher than commonParent → we can't map
            if (filePath) {
                const relativePath = relative(absSource, absFile);
                return getRelativeModelPath(targetDir, relativePath);
            }

            return filePath;
        }

        // Collecting: targetDir → commonParent → file
        const pathFromTargetToCommon = relative(absTarget, commonParent);
        const pathFromCommonToFile = fileRelToCommon;

        return resolve(absTarget, pathFromTargetToCommon, pathFromCommonToFile);
    }

    // 3. There is no common parent → return as is
    return filePath;
}
