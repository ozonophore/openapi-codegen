import os from 'os';
import path from 'path';

const isWin = os.platform() === 'win32';
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
    
    let _folderPath = folderPath;
    if (isWin) {
        _folderPath = _folderPath.replace(/\//g, '\\');
    }
    if (resolvedPath.startsWith(_folderPath)) {
        mappedPaths = modelPath;
    }

    return mappedPaths;
}
