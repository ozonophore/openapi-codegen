import { basename } from 'path';

import { dirNameHelper, joinToDirHelper, relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { isDirectory } from './isDirectory';
import { isFileName } from './isFileName';
import { mapPathToTargetDirSafe } from './mapPathToTargetDirSafe';
import { parseRef, RefType } from './parseRef';
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
    const absOutputModelsPath = resolveHelper(outputModelsPath);
    const sourceRoot = isDirectory(mainSpecPath) ? mainSpecPath : dirNameHelper(mainSpecPath);
    const parsed = parseRef(refValuePath);

    // KEY CASE: internal link (#/components/schemas/Xxx)
    if (parsed.type === RefType.LOCAL_FRAGMENT) {
        // stripNamespace transform "#/components/schemas/AccountField" → "AccountField"
        const modelName = stripNamespace(refValuePath);

        // Determinarea de unde provine legătura (pentru o cale relativă)
        const cleanParent = stripNamespace(parentFilePath || mainSpecPath);
        const parentDirInSource = dirNameHelper(cleanParent);
        const parentDirInOutput = mapPathToTargetDirSafe(parentDirInSource, sourceRoot, outputModelsPath);

        // Crearea căii către fișierul model
        const modelFilePathInOutput = resolveHelper(parentDirInOutput, modelName);
        const absModelPath = resolveHelper(modelFilePathInOutput);

        if (!absModelPath.startsWith(absOutputModelsPath + '/') && absModelPath !== absOutputModelsPath) {
            return `./${modelName}`;
        }

        const relativePath = relativeHelper(absOutputModelsPath, absModelPath);

        return relativePath;
    }

    const parentClean = stripNamespace(parentFilePath || '') || '';
    const parentDirForResolve = parentClean ? dirNameHelper(parentClean) : sourceRoot;
    const refValueClean = stripNamespace(refValuePath || '') || refValuePath;

    // KEY CASE: external file (./other-file.yaml)
    if (parsed.type === RefType.EXTERNAL_FILE) {
        const targetFileAbs = joinToDirHelper(parentDirForResolve, refValueClean);
        const targetPathInOutput = mapPathToTargetDirSafe(targetFileAbs, sourceRoot, outputModelsPath);
        const absTargetPath = resolveHelper(targetPathInOutput);

        if (!absTargetPath.startsWith(absOutputModelsPath + '/') && absTargetPath !== absOutputModelsPath) {
            const fallbackName = stripNamespace(basename(targetFileAbs));

            return `./${fallbackName}`;
        }

        const relativePath = relativeHelper(absOutputModelsPath, absTargetPath);

        return relativePath;
    }

    const targetFileAbs = isFileName(refValueClean) ? joinToDirHelper(parentDirForResolve, refValueClean) : resolveHelper(parentDirForResolve, refValueClean);
    const targetPathInOutput = mapPathToTargetDirSafe(targetFileAbs, sourceRoot, outputModelsPath);
    const absTargetPath = resolveHelper(targetPathInOutput);

    if (!absTargetPath.startsWith(absOutputModelsPath + '/') && absTargetPath !== absOutputModelsPath) {
        const fallbackName = stripNamespace(basename(targetFileAbs));

        return `./${fallbackName}`;
    }

    const relativePath = relativeHelper(absOutputModelsPath, absTargetPath);

    return relativePath;
}
