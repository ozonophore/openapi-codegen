import { basename } from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { dirNameHelper, joinHelper, relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { mapPathToTargetDirSafe } from './mapPathToTargetDirSafe';
import { parseRef, RefType } from './parseRef';
import { stripNamespace } from './stripNamespace';

interface IParams {
    mainSpecPath: string;
    parentFilePath: string;
    refValuePath: string;
    outputModelsPath: string;
}

/**
 * Resolves model path and returns relative path or fallback name.
 * Returns fallback if the path is outside outputModelsPath, otherwise returns relative path.
 */
function resolveModelPath(
    absModelPath: string,
    absOutputModelsPath: string,
    fallbackName: string
): string {
    if (!absModelPath.startsWith(absOutputModelsPath + '/') && absModelPath !== absOutputModelsPath) {
        return `./${fallbackName}`;
    }
    return relativeHelper(absOutputModelsPath, absModelPath);
}

/**
 * Resolves fragment reference (LOCAL_FRAGMENT or EXTERNAL_FILE_FRAGMENT).
 * Both types use the same logic: resolve model path based on parent file location.
 */
function resolveFragmentRef(
    modelName: string,
    parentFilePath: string,
    mainSpecPath: string,
    sourceRoot: string,
    outputModelsPath: string,
    absOutputModelsPath: string
): string {
    const cleanParentForLocal = stripNamespace(parentFilePath || mainSpecPath);
    const parentDirInSource = dirNameHelper(cleanParentForLocal);
    const parentDirInOutput = mapPathToTargetDirSafe(parentDirInSource, sourceRoot, outputModelsPath);
    const modelFilePathInOutput = resolveHelper(parentDirInOutput, modelName);
    const absModelPath = resolveHelper(modelFilePathInOutput);

    return resolveModelPath(absModelPath, absOutputModelsPath, modelName);
}

/**
 * Resolves external file or absolute path reference.
 * Maps the target file path to output directory and returns relative path or fallback.
 */
function resolveExternalFileOrAbsolutePath(
    targetFileAbs: string,
    sourceRoot: string,
    outputModelsPath: string,
    absOutputModelsPath: string
): string {
    const targetPathInOutput = mapPathToTargetDirSafe(targetFileAbs, sourceRoot, outputModelsPath);
    const absTargetPath = resolveHelper(targetPathInOutput);
    const fallbackName = stripNamespace(basename(targetFileAbs));

    return resolveModelPath(absTargetPath, absOutputModelsPath, fallbackName);
}

/**
 * Prepares parent directory for resolving relative references.
 * Handles both file and directory paths.
 */
function prepareParentDirForResolve(
    parentFilePath: string,
    mainSpecPath: string,
    sourceRoot: string
): string {
    const parentParsed = parentFilePath ? parseRef(parentFilePath) : null;
    const parentRaw = parentParsed?.filePath ? parentParsed.filePath : '';
    const parentClean = stripNamespace(parentRaw);

    let parentDirForResolve = fileSystemHelpers.isPathToFile(sourceRoot) ? dirNameHelper(sourceRoot) : sourceRoot;
    if (parentClean) {
        parentDirForResolve = fileSystemHelpers.isPathToFile(parentRaw) ? dirNameHelper(parentClean) : parentClean;
    }

    return parentDirForResolve.endsWith('/') ? parentDirForResolve : parentDirForResolve + '/';
}

/**
 * Removes parent basename prefix from reference value if present.
 * This handles cases where refValuePath starts with parent directory name.
 */
function removeParentBasenamePrefix(refValueClean: string, parentDirForResolveWithSep: string): string {
    const baseNameParent = basename(parentDirForResolveWithSep);
    const baseNameParentWithSep = baseNameParent.endsWith('/') ? baseNameParent : baseNameParent + '/';
    
    return refValueClean.startsWith(baseNameParentWithSep) 
        ? refValueClean.replace(baseNameParentWithSep, '') 
        : refValueClean;
}

/**
 * Resolves $ref reference to import path for generated code.
 * Handles HTTP URLs, local fragments, external file fragments, external files, and absolute paths.
 */
export function resolveRefToImportPath({ mainSpecPath, parentFilePath, refValuePath, outputModelsPath }: IParams) {
    const absOutputModelsPath = resolveHelper(outputModelsPath);
    const sourceRoot = fileSystemHelpers.isDirectory(mainSpecPath) ? mainSpecPath : dirNameHelper(mainSpecPath);
    const parsed = parseRef(refValuePath);

    // HTTP URLs are returned as-is
    if (parsed.type === RefType.HTTP_URL) {
        return refValuePath;
    }

    // LOCAL_FRAGMENT: reference to component in the same file (e.g., #/components/schemas/User)
    if (parsed.type === RefType.LOCAL_FRAGMENT) {
        const modelName = stripNamespace(refValuePath);
        return resolveFragmentRef(
            modelName,
            parentFilePath,
            mainSpecPath,
            sourceRoot,
            outputModelsPath,
            absOutputModelsPath
        );
    }

    // EXTERNAL_FILE_FRAGMENT: reference to component in external file (e.g., ./file.yaml#/components/schemas/User)
    if (parsed.type === RefType.EXTERNAL_FILE_FRAGMENT) {
        const refFileRaw = parsed?.fragment ? parsed.fragment : '';
        const modelName = stripNamespace(refFileRaw || '') || '';
        return resolveFragmentRef(
            modelName,
            parentFilePath,
            mainSpecPath,
            sourceRoot,
            outputModelsPath,
            absOutputModelsPath
        );
    }

    // Prepare parent directory for resolving relative references
    // This is used for both EXTERNAL_FILE and ABSOLUTE_PATH (default case)
    const parentDirForResolveWithSep = prepareParentDirForResolve(parentFilePath, mainSpecPath, sourceRoot);
    const refValueClean = stripNamespace(refValuePath || '') || refValuePath;
    const currentRefValue = removeParentBasenamePrefix(refValueClean, parentDirForResolveWithSep);

    // EXTERNAL_FILE: reference to external file (e.g., ./file.yaml)
    if (parsed.type === RefType.EXTERNAL_FILE) {
        const targetFileAbs = joinHelper(parentDirForResolveWithSep, currentRefValue);
        return resolveExternalFileOrAbsolutePath(
            targetFileAbs,
            sourceRoot,
            outputModelsPath,
            absOutputModelsPath
        );
    }

    // ABSOLUTE_PATH (default case): absolute path reference
    const targetFileAbs = fileSystemHelpers.isPathToFile(refValueClean) 
        ? joinHelper(parentDirForResolveWithSep, refValueClean)
        : resolveHelper(parentDirForResolveWithSep, refValueClean);

    return resolveExternalFileOrAbsolutePath(
        targetFileAbs,
        sourceRoot,
        outputModelsPath,
        absOutputModelsPath
    );
}