import { basename } from 'path';

import { dirNameHelper, normalizeHelper, relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { OutputPaths } from '../types/base/OutputPaths.model';
import { splitCanonicalRef } from '../utils/canonicalRef';
import { internParserKey } from '../utils/parserKeyMatch';
import { isRemoteSourceFile, RefLookup } from '../utils/refLookup';

interface VirtualFileEntry {
    sourceFile: string;
    outputFile: string;
    fragments: Set<string>;
}

type RefsForBuild = {
    paths: (...args: any[]) => string[];
    get: (...args: any[]) => unknown;
};

export class VirtualFileMap {
    readonly output: OutputPaths;
    private readonly _virtualFiles: Map<string, VirtualFileEntry>;
    private readonly _canonicalRefs: Set<string>;
    private readonly _refLookup: RefLookup;

    constructor(output: OutputPaths, virtualFiles: Map<string, VirtualFileEntry>, canonicalRefs: Set<string>, refLookup: RefLookup) {
        this.output = output;
        this._virtualFiles = virtualFiles;
        this._canonicalRefs = canonicalRefs;
        this._refLookup = refLookup;
    }

    resolve(canonicalRef: string, parentSourceFile?: string): { outputFile: string; fragment?: string } | undefined {
        const lookupKey = this._refLookup.toCanonicalRef(canonicalRef, parentSourceFile);
        const { sourceFile, pointer } = splitCanonicalRef(lookupKey);
        if (!sourceFile || isRemoteSourceFile(sourceFile)) {
            return undefined;
        }
        const file = this._virtualFiles.get(sourceFile);
        if (!file) return undefined;
        return { outputFile: file.outputFile, fragment: pointer };
    }

    getCanonicalRefs(): string[] {
        return [...this._canonicalRefs];
    }
}

export function buildVirtualFileMap(refs: RefsForBuild, refLookup: RefLookup, entryFile: string, output: OutputPaths): VirtualFileMap {
    const virtualFiles = new Map<string, VirtualFileEntry>();
    const canonicalRefs = new Set<string>();

    const normalizedEntry = refLookup.entryFile || '';
    const specRoot = posixNormalize(posixDirname(normalizedEntry));

    if (normalizedEntry && !isRemoteSourceFile(normalizedEntry) && !virtualFiles.has(normalizedEntry)) {
        virtualFiles.set(normalizedEntry, {
            sourceFile: normalizedEntry,
            outputFile: mapToOutput(normalizedEntry, specRoot, output),
            fragments: new Set(),
        });
    }

    const allPaths = refs.paths() || [];
    for (const refPath of allPaths) {
        const sourceFile = splitCanonicalRef(refPath).sourceFile;
        if (!sourceFile || isRemoteSourceFile(sourceFile)) {
            continue;
        }
        if (!virtualFiles.has(sourceFile)) {
            virtualFiles.set(sourceFile, {
                sourceFile,
                outputFile: mapToOutput(sourceFile, specRoot, output),
                fragments: new Set(),
            });
        }
    }

    for (const [sourceFile] of virtualFiles) {
        try {
            const schema = refs.get(sourceFile);
            if (schema && typeof schema === 'object') {
                walkForFragments(schema, sourceFile, refLookup, virtualFiles, canonicalRefs, specRoot, output);
            }
        } catch {
            // Skip unresolved entries from refs.paths().
        }
    }

    return new VirtualFileMap(output, virtualFiles, canonicalRefs, refLookup);
}

function posixDirname(filePath: string): string {
    const file = splitCanonicalRef(filePath).sourceFile;
    return dirNameHelper(file);
}

function posixNormalize(filePath: string): string {
    const file = splitCanonicalRef(filePath).sourceFile;
    if (!file) return '';
    return normalizeHelper(file);
}

function mapToOutput(sourceFile: string, specRoot: string, output: OutputPaths): string {
    const alignedRoot = internParserKey(specRoot);
    const alignedSource = internParserKey(sourceFile);
    const relative = relativeHelper(alignedRoot, alignedSource);
    const dir = posixDirname(relative);
    const baseName = basename(relative).replace(/\.(yaml|yml|json)$/i, '.ts');
    return resolveHelper(output.outputModels, dir, baseName);
}

function walkForFragments(
    obj: any,
    parentSourceFile: string,
    refLookup: RefLookup,
    virtualFiles: Map<string, VirtualFileEntry>,
    canonicalRefs: Set<string>,
    specRoot: string,
    output: OutputPaths
): void {
    if (!obj || typeof obj !== 'object') return;

    if (typeof obj.$ref === 'string') {
        const canonicalRef = refLookup.toCanonicalRef(obj.$ref, parentSourceFile);
        const { sourceFile, pointer } = splitCanonicalRef(canonicalRef);

        if (isRemoteSourceFile(sourceFile)) {
            canonicalRefs.add(canonicalRef);
        } else {
            const exact = refLookup.internExact(sourceFile);
            if (exact) {
                canonicalRefs.add(canonicalRef);
                let entry = virtualFiles.get(exact);
                if (!entry) {
                    entry = {
                        sourceFile: exact,
                        outputFile: mapToOutput(exact, specRoot, output),
                        fragments: new Set(),
                    };
                    virtualFiles.set(exact, entry);
                }
                if (pointer) {
                    entry.fragments.add(pointer);
                }
            }
        }
    }

    if (Array.isArray(obj)) {
        obj.forEach(item => walkForFragments(item, parentSourceFile, refLookup, virtualFiles, canonicalRefs, specRoot, output));
        return;
    }

    for (const value of Object.values(obj)) {
        walkForFragments(value, parentSourceFile, refLookup, virtualFiles, canonicalRefs, specRoot, output);
    }
}
