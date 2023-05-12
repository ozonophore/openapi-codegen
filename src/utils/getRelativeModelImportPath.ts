import path from 'path';

import { resolve } from '../core/path';
import { getRelativeModelPath } from './getRelativeModelPath';

/**
 * The function calculates the relative import path for model.
 * @param rootPath Root folder path.
 * @param relativePath Import relative path.
 * @param modelPath Model relative path.
 * @returns Current relative model import path.
 */
export function getRelativeModelImportPath(rootPath: string, relativePath: string, modelPath: string) {
    const normalizedRelative = path.normalize(relativePath);

    if (!normalizedRelative.startsWith('..')) {
        return normalizedRelative;
    }

    const absoluteModelPath = resolve(rootPath, modelPath);
    const updatedRelativePath = getRelativeModelPath(rootPath, normalizedRelative);
    const absoluteImportPath = resolve(rootPath, updatedRelativePath);

    const newRelativePath = calculateRelativePath(absoluteModelPath, absoluteImportPath);

    return newRelativePath;
}

/**
 *
 * @param firstPath
 * @param secondPath
 * @returns
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
    const relativePath = backtracking + forwardPath;

    return relativePath;
}
