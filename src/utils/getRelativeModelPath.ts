import { resolve } from '../core/path';
import { replaceString } from '../core/replaceString';
import { stripNamespace } from './stripNamespace';

/**
 * The function calculates the relative path to the model.
 * Removes the transition to the directory with a level above.
 * @param folderPath Root folder.
 * @param relativeModelPath Relative path to the model.
 * @returns Correct relative model path.
 */
export function getRelativeModelPath(folderPath: string | undefined, relativeModelPath: string) {
    if (!folderPath) {
        return relativeModelPath;
    }
    const pathSep = '/';
    let mappedPaths = '';
    let modelPath = relativeModelPath;
    if (modelPath.startsWith('../')) {
        const pathArray = modelPath.split(pathSep).filter(Boolean);

        while (pathArray[0] === '..') {
            pathArray.shift();
        }

        modelPath = pathArray.join(pathSep);
    }
    const resolvedPath = resolve(folderPath, modelPath);
    if (resolvedPath.startsWith(folderPath)) {
        mappedPaths = modelPath;
    }

    const normalizedValue = replaceString(mappedPaths);
    mappedPaths = stripNamespace(normalizedValue || '');
    return mappedPaths;
}
