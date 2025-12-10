import { relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { findCommonParent } from './findCommonParent';
import { getRelativeModelPath } from './getRelativeModelPath';

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

    const absFile = resolveHelper(filePath);
    const absSource = resolveHelper(sourceDir);
    const absTarget = resolveHelper(targetDir);

    const sourceWithSep = absSource.endsWith(pathSep) ? absSource : absSource + pathSep;

    // 1. The file inside SourceDir → mapim as usual
    if (absFile.startsWith(sourceWithSep)) {
        const rel = relativeHelper(absSource, absFile);
        return resolveHelper(absTarget, rel);
    }

    // 2. The file is outside SourceDir, but in a common parent
    const commonParent = findCommonParent(absSource, absFile);
    if (commonParent) {
        // Path from commonParent → file
        const fileRelToCommon = relativeHelper(commonParent, absFile);

        // Path from targetDir → commonParent
        const targetToCommon = relativeHelper(absTarget, commonParent);
        if (targetToCommon.includes('..')) {
            // targetDir is higher than commonParent → we can't map
            if (filePath) {
                const relativePath = relativeHelper(absSource, absFile);
                return getRelativeModelPath(targetDir, relativePath);
            }

            return filePath;
        }

        // Collecting: targetDir → commonParent → file
        const pathFromTargetToCommon = relativeHelper(absTarget, commonParent);
        const pathFromCommonToFile = fileRelToCommon;

        return resolveHelper(absTarget, pathFromTargetToCommon, pathFromCommonToFile);
    }

    // 3. There is no common parent → return as is
    return filePath;
}
