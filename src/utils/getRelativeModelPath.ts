import path from 'path';

/**
 * The function calculates the relative path to the model.
 * Removes the transition to the directory with a level above.
 * @param folderPath Root folder.
 * @param relativeModelPath Relative path to the model.
 * @returns Correct relative model path.
 */
export function getRelativeModelPath(folderPath: string, relativeModelPath: string) {
    let mappedPaths = '';
    let modelPath = relativeModelPath;
    if (modelPath.startsWith('../')) {
        const pathArray = modelPath.split(path.sep).filter(Boolean);

        while (pathArray[0] === '..') {
            pathArray.shift();
        }

        modelPath = pathArray.join(path.sep);
    }
    const resolvedPath = path.resolve(folderPath, modelPath);
    if (resolvedPath.startsWith(folderPath)) {
        mappedPaths = modelPath;
    }

    return mappedPaths;
}
