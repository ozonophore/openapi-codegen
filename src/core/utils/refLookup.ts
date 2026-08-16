import { joinCanonicalRef, splitCanonicalRef } from './canonicalRef';
import { fileUrlToFilePath, isAbsoluteSourceFile, isFileUrl, joinTreeRefFile, toPosixSlashes } from './joinTreeRefFile';
import { internParserKey } from './parserKeyMatch';

/**
 * (Parent source file, Tree $ref) → Canonical Ref.
 * Matches SwaggerParser `$Refs` keys. Does not use `path.resolve`.
 */
export class RefLookupError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RefLookupError';
    }
}

export function isRemoteSourceFile(file: string): boolean {
    return file.startsWith('http://') || file.startsWith('https://');
}

function assertParentSourceFile(parentSourceFile: string): void {
    if (parentSourceFile.includes('#')) {
        throw new RefLookupError(`Parent source file must not include a Pointer: ${parentSourceFile}`);
    }
    if (!isAbsoluteSourceFile(parentSourceFile)) {
        throw new RefLookupError(`Parent source file must be an absolute path: ${parentSourceFile}`);
    }
}

export class RefLookup {
    private readonly intern = new Map<string, string>();
    readonly entryFile: string;

    constructor(parserFileKeys: string[], entryFile: string) {
        for (const key of parserFileKeys) {
            const source = splitCanonicalRef(key).sourceFile;
            if (!source) {
                continue;
            }
            this.intern.set(internParserKey(source), source);
        }
        const entrySource = splitCanonicalRef(entryFile).sourceFile;
        this.entryFile = this.intern.get(internParserKey(entrySource)) ?? entrySource;
        if (this.entryFile && !this.intern.has(internParserKey(this.entryFile))) {
            this.intern.set(internParserKey(this.entryFile), this.entryFile);
        }
    }

    internExact(filePath: string): string | undefined {
        if (!filePath) {
            return undefined;
        }
        return this.intern.get(internParserKey(filePath));
    }

    toCanonicalRef(treeRef: string, parentSourceFile?: string): string {
        if (!treeRef) {
            return treeRef;
        }

        if (isRemoteSourceFile(treeRef)) {
            return treeRef;
        }

        const { sourceFile, pointer } = splitCanonicalRef(treeRef);

        if (isRemoteSourceFile(sourceFile)) {
            return joinCanonicalRef({ sourceFile, pointer });
        }

        if (parentSourceFile) {
            assertParentSourceFile(parentSourceFile);
        }

        if (!sourceFile) {
            const parent = parentSourceFile || this.entryFile;
            if (!parent) {
                throw new RefLookupError(`Pointer-only Tree $ref requires a Parent source file or Entry file: ${treeRef}`);
            }
            if (!parentSourceFile) {
                assertParentSourceFile(parent);
            }
            return this.internJoin(parent, pointer);
        }

        if (isFileUrl(sourceFile)) {
            const pathFromUrl = fileUrlToFilePath(new URL(toPosixSlashes(sourceFile)));
            return this.internJoin(pathFromUrl, pointer);
        }

        const slashFile = toPosixSlashes(sourceFile);
        if (isAbsoluteSourceFile(slashFile)) {
            return this.internJoin(slashFile, pointer);
        }

        if (!parentSourceFile) {
            throw new RefLookupError(`Relative Tree $ref requires a Parent source file: ${treeRef}`);
        }

        const joined = joinTreeRefFile(parentSourceFile, slashFile);
        if (isRemoteSourceFile(joined)) {
            return joinCanonicalRef({ sourceFile: joined, pointer });
        }
        return this.internJoin(joined, pointer);
    }

    private internJoin(filePath: string, pointer?: string): string {
        const exact = this.internExact(filePath) ?? filePath;
        return joinCanonicalRef({ sourceFile: exact, pointer });
    }
}
