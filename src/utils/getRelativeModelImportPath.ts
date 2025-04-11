import path from 'path';

import { replaceString } from '../core/replaceString';
import { getRelativeModelPath } from './getRelativeModelPath';
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

    const normalizedSourcePath = stripNamespace(sourcePath);
    let absSourcePath = path.resolve(rootPath, normalizedSourcePath);
    if (!absSourcePath.startsWith(rootPath)) {
        const sourceRelativePath = getRelativeModelPath(rootPath, sourcePath);
        absSourcePath = path.resolve(rootPath, sourceRelativePath);
    }
    const absSourceDir = normalizedSourcePath ? path.dirname(absSourcePath) : rootPath;

    let absTargetPath = path.resolve(absSourceDir, targetPath);

    if (!absTargetPath.startsWith(rootPath)) {
        const targetRelativePath = getRelativeModelPath(rootPath, targetPath);
        absTargetPath = path.resolve(rootPath, targetRelativePath);
    }

    let relativePath = path.relative(absSourceDir, absTargetPath);
    relativePath = replaceString(relativePath) || '';
    let normalizedValue = stripNamespace(relativePath);

    if (!normalizedValue.startsWith('.') && !normalizedValue.startsWith('/')) {
        normalizedValue = `./${normalizedValue}`;
    }

    return normalizedValue;
}
