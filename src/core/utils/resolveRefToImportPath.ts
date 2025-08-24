import { basename, dirname, relative, resolve } from 'path';

import { isDirectory } from './isDirectory';
import { isFileName } from './isFileName';
import { mapPathToTargetDirSafe } from './mapPathToTargetDirSafe';
import { parseRef, RefType } from './parseRef';
import { joinToDir } from './pathHelpers';
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
    const sourceRoot = isDirectory(mainSpecPath) ? mainSpecPath : dirname(mainSpecPath);
    const parsed = parseRef(refValuePath);

    // KEY CASE: internal link (#/components/schemas/Xxx)
    if (parsed.type === RefType.LOCAL_FRAGMENT) {
        // stripNamespace transform "#/components/schemas/AccountField" → "AccountField"
        const modelName = stripNamespace(refValuePath);

        // Determinarea de unde provine legătura (pentru o cale relativă)
        const cleanParent = stripNamespace(parentFilePath || mainSpecPath);
        const parentDirInSource = dirname(cleanParent);
        const parentDirInOutput = mapPathToTargetDirSafe(parentDirInSource, sourceRoot, outputModelsPath);

        // Crearea căii către fișierul model
        const modelFilePathInOutput = resolve(parentDirInOutput, modelName);
        const absModelPath = resolve(modelFilePathInOutput);

        if (!absModelPath.startsWith(absOutputModelsPath + '/') && absModelPath !== absOutputModelsPath) {
            return `./${modelName}`;
        }

        const relativePath = relative(absOutputModelsPath, absModelPath);

        return `./${relativePath.replace(/\\/g, '/')}`;
    }

    // Restul cazurilor sunt legături externe (funcționează ca înainte)
    const parentClean = stripNamespace(parentFilePath || '') || '';
    const refValueClean = stripNamespace(refValuePath || '') || refValuePath;
    const parentDirForResolve = parentClean ? dirname(parentClean) : sourceRoot;

    const targetFileAbs = isFileName(refValueClean) ? joinToDir(parentDirForResolve, refValueClean) : resolve(parentDirForResolve, refValueClean);

    const targetPathInOutput = mapPathToTargetDirSafe(targetFileAbs, sourceRoot, outputModelsPath);
    const absTargetPath = resolve(targetPathInOutput);

    if (!absTargetPath.startsWith(absOutputModelsPath + '/') && absTargetPath !== absOutputModelsPath) {
        const fallbackName = stripNamespace(basename(targetFileAbs));

        return `./${fallbackName}`;
    }

    const relativePath = relative(absOutputModelsPath, absTargetPath);

    return `./${relativePath.replace(/\\/g, '/')}`;
}
