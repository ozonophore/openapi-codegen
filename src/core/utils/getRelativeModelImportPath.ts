import {isAbsolute} from 'path';

import { dirNameHelper, relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { getRelativeModelPath } from './getRelativeModelPath';
import { isInsideDirectory } from './isInsideDirectory';
import { normalizedAbsolutePath } from './normalizedAbsolutePath';
import { replaceString } from './replaceString';
import { stripNamespace } from './stripNamespace';

/**
 * The function calculates the relative import path for model.
 * @param rootPath Root folder path.
 * @param sourcePath Import relative path.
 * @param targetPath Model relative path.
 * @returns Current relative model import path.
 */
export function getRelativeModelImportPath(rootPath: string | undefined, sourcePath: string, targetPath: string) {
    if (!rootPath) {
        const normalizedValue = replaceString(targetPath);
        return stripNamespace(normalizedValue || '');
    }

    const absoluteRoot = normalizedAbsolutePath(rootPath);
    const normalizedSourcePath = stripNamespace(sourcePath);
    let absSourcePath = normalizedAbsolutePath(resolveHelper(absoluteRoot, normalizedSourcePath));
    if (!isInsideDirectory(absSourcePath, absoluteRoot)) {
        const sourceRelativePath = getRelativeModelPath(absoluteRoot, sourcePath);
        absSourcePath = resolveHelper(absoluteRoot, sourceRelativePath);
    }
    const absSourceDir = normalizedSourcePath ? dirNameHelper(absSourcePath) : absoluteRoot;

    let absTargetPath = isAbsolute(targetPath) ? targetPath : resolveHelper(absSourceDir, targetPath);

    if (!isInsideDirectory(absTargetPath, rootPath)) {
        const targetRelativePath = getRelativeModelPath(absoluteRoot, targetPath);
        absTargetPath = resolveHelper(absoluteRoot, targetRelativePath);
    }

    let relativePath = relativeHelper(absSourceDir, absTargetPath);
    relativePath = replaceString(relativePath) || '';
    let normalizedValue = stripNamespace(relativePath);

    if (!normalizedValue.startsWith('.') && !normalizedValue.startsWith('/')) {
        normalizedValue = `./${normalizedValue}`;
    }

    return normalizedValue;
}
