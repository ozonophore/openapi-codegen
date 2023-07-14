import path from 'path';

import { resolve } from '../core/path';
import { replaceString } from '../core/replaceString';
import { getRelativeModelPath } from './getRelativeModelPath';
import { isPathWithRoot } from './isPathWithRoot';
import { stripNamespace } from './stripNamespace';

/**
 * The function calculates the relative import path for model.
 * @param rootPath Root folder path.
 * @param relativePath Import relative path.
 * @param modelPath Model relative path.
 * @returns Current relative model import path.
 */
export function getRelativeModelImportPath(rootPath: string | undefined, relativePath: string, modelPath: string) {
    if (!rootPath) {
        return relativePath;
    }
    const normalizedRelative = path.normalize(relativePath);

    if (!normalizedRelative.startsWith('..')) {
        return normalizedRelative;
    }

    let modelRelativePath = modelPath;
    const isWithRoot = isPathWithRoot(rootPath, modelRelativePath);
    if (!isWithRoot) {
        modelRelativePath = getRelativeModelPath(rootPath, modelRelativePath);
    }
    const absoluteModelPath = resolve(rootPath, modelRelativePath);
    const updatedRelativePath = getRelativeModelPath(rootPath, normalizedRelative);
    const absoluteImportPath = resolve(rootPath, updatedRelativePath);

    const newRelativePath = calculateRelativePath(absoluteModelPath, absoluteImportPath);

    return newRelativePath;
}

/**
 * The function calculates the correct relative path.
 * @param firstPath Root path.
 * @param secondPath RelativePath.
 * @returns Current relative model import path.
 */
function calculateRelativePath(firstPath: string, secondPath: string): string {
    const firstPathArr = firstPath.split('/');
    const secondPathArr = secondPath.split('/');

    let i = 0;
    while (i < firstPathArr.length && i < secondPathArr.length && firstPathArr[i] === secondPathArr[i]) {
        i++;
    }

    const backtracking = '../'.repeat(firstPathArr.length - i - 1);
    const forwardPath = secondPathArr.slice(i).join('/');
    let relativePath = backtracking + forwardPath;
    const normalizedValue = replaceString(relativePath);
    relativePath = stripNamespace(normalizedValue || '');
    return relativePath;
}
