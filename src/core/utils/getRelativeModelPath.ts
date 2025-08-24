import { getTypeName } from './getTypeName';
import { isInsideDirectory } from './isInsideDirectory';
import { resolve } from './pathHelpers';
import { replaceString } from './replaceString';
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

    // If absolute path (filesystem or URL-like), collapse to type name only
    if (modelPath.startsWith('/')) {
        return getTypeName(modelPath);
    }
    if (modelPath.startsWith('../')) {
        const pathArray = modelPath.split(pathSep).filter(Boolean);

        while (pathArray[0] === '..') {
            pathArray.shift();
        }

        modelPath = pathArray.join(pathSep);
    }
    const resolvedPath = resolve(folderPath, modelPath);
    if (isInsideDirectory(resolvedPath, folderPath)) {
        mappedPaths = modelPath;
    }

    const normalizedValue = replaceString(mappedPaths);
    mappedPaths = stripNamespace(normalizedValue || '');
    return mappedPaths;
}
