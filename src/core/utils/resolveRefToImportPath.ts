import { basename } from 'path';

import { isDirectory } from './isDirectory';
import { isFileName } from './isFileName';
import { mapPathToTargetDirSafe } from './mapPathToTargetDirSafe';
import { parseRef, RefType } from './parseRef';
import { dirName, joinToDir, relative, resolve } from './pathHelpers';
import { stripNamespace } from './stripNamespace';

export function resolveRefToImportPath({
    mainSpecPath,
    parentFilePath,
    refValuePath,
    outputModelsPath,
}: {
    mainSpecPath: string;
    parentFilePath: string;
    refValuePath: string;
    outputModelsPath: string;
}) {
    const absOutputModelsPath = resolve(outputModelsPath);
    const sourceRoot = isDirectory(mainSpecPath) ? mainSpecPath : dirName(mainSpecPath);
    const parsed = parseRef(refValuePath);

    // KEY CASE: internal link (#/components/schemas/Xxx)
    if (parsed.type === RefType.LOCAL_FRAGMENT) {
        // stripNamespace transform "#/components/schemas/AccountField" → "AccountField"
        const modelName = stripNamespace(refValuePath);

        // Determinarea de unde provine legătura (pentru o cale relativă)
        const cleanParent = stripNamespace(parentFilePath || mainSpecPath);
        const parentDirInSource = dirName(cleanParent);
        const parentDirInOutput = mapPathToTargetDirSafe(parentDirInSource, sourceRoot, outputModelsPath);

        const modelFilePathInOutput = resolve(parentDirInOutput, modelName);
        const absModelPath = resolve(modelFilePathInOutput);

        if (!absModelPath.startsWith(absOutputModelsPath + '/') && absModelPath !== absOutputModelsPath) {
            return `./${modelName}`;
        }

        const relativePath = relative(absOutputModelsPath, absModelPath);

        return relativePath;
    }

    const parentClean = stripNamespace(parentFilePath || '') || '';
    const parentDirForResolve = parentClean ? dirName(parentClean) : sourceRoot;
    const refValueClean = stripNamespace(refValuePath || '') || refValuePath;

    // KEY CASE: external file (./other-file.yaml)
    if (parsed.type === RefType.EXTERNAL_FILE) {
        const targetFileAbs = joinToDir(parentDirForResolve, refValueClean);
        const targetPathInOutput = mapPathToTargetDirSafe(targetFileAbs, sourceRoot, outputModelsPath);
        const absTargetPath = resolve(targetPathInOutput);

        if (!absTargetPath.startsWith(absOutputModelsPath + '/') && absTargetPath !== absOutputModelsPath) {
            const fallbackName = stripNamespace(basename(targetFileAbs));

            return `./${fallbackName}`;
        }

        const relativePath = relative(absOutputModelsPath, absTargetPath);

        return relativePath;
    }

    const targetFileAbs = isFileName(refValueClean) ? joinToDir(parentDirForResolve, refValueClean) : resolve(parentDirForResolve, refValueClean);
    const targetPathInOutput = mapPathToTargetDirSafe(targetFileAbs, sourceRoot, outputModelsPath);
    const absTargetPath = resolve(targetPathInOutput);

    if (!absTargetPath.startsWith(absOutputModelsPath + '/') && absTargetPath !== absOutputModelsPath) {
        const fallbackName = stripNamespace(basename(targetFileAbs));

        return `./${fallbackName}`;
    }

    const relativePath = relative(absOutputModelsPath, absTargetPath);

    return relativePath;
}
