import path from 'path';
import type { ImportDeclaration } from 'ts-morph';

import type { Contract } from '../types';

export interface ApiImportScope {
    entryFilePath: string;
    apiRootDir: string;
}

export function createApiImportScope(sourcePath: string): ApiImportScope {
    const entryFilePath = path.resolve(sourcePath);
    const apiRootDir = path.dirname(entryFilePath) + path.sep;
    return { entryFilePath, apiRootDir };
}

function resolvePath(filePath: string): string {
    return path.resolve(filePath);
}

function isUnderApiRoot(resolvedPath: string, scope: ApiImportScope): boolean {
    const normalized = resolvePath(resolvedPath);
    if (normalized === resolvePath(scope.entryFilePath)) {
        return true;
    }
    return normalized.startsWith(scope.apiRootDir);
}

export function isApiImport(imp: ImportDeclaration, scope: ApiImportScope): boolean {
    const importedSource = imp.getModuleSpecifierSourceFile();
    if (!importedSource) {
        return false;
    }
    return isUnderApiRoot(importedSource.getFilePath(), scope);
}

export function getAllowedExportsForImport(imp: ImportDeclaration, scope: ApiImportScope, contract: Contract): Set<string> {
    const importedSource = imp.getModuleSpecifierSourceFile();
    if (!importedSource) {
        return new Set();
    }

    if (resolvePath(importedSource.getFilePath()) === resolvePath(scope.entryFilePath)) {
        return new Set(contract.sourceFile.getExportedDeclarations().keys());
    }

    return new Set(importedSource.getExportedDeclarations().keys());
}
