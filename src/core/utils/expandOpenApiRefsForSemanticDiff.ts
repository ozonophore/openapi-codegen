import path from 'path';

import { normalizeHelper, resolveHelper } from '../../common/utils/pathHelpers';

/**
 * Резолвер ссылок для семантического diff.
 * @property [exists] проверка существования ссылки
 * @property get получение значения по ссылке
 */
export type SemanticRefResolver = {
    exists?: (ref: string) => boolean;
    get: (ref: string) => unknown;
};

type RefTarget = {
    canonicalRef: string;
    sourceFile?: string;
    value: unknown;
};

type ParsedRef = {
    file?: string;
    pointer?: string;
};

type ExpandOptions = {
    refs?: SemanticRefResolver;
    sourceFile?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isUrlLike(value: string): boolean {
    return /^[a-z][a-z\d+\-.]*:/i.test(value);
}

function normalizeSourceFile(sourceFile: string | undefined): string | undefined {
    if (!sourceFile || isUrlLike(sourceFile)) {
        return sourceFile;
    }

    return normalizeHelper(sourceFile);
}

function parseRef(ref: string): ParsedRef {
    const fragmentIndex = ref.indexOf('#');
    if (fragmentIndex === -1) {
        return { file: ref || undefined };
    }

    const file = ref.slice(0, fragmentIndex);
    const pointer = ref.slice(fragmentIndex);
    return {
        file: file || undefined,
        pointer: pointer || '#',
    };
}

function normalizeRefFile(file: string | undefined, currentSourceFile: string | undefined): string | undefined {
    if (!file) {
        return normalizeSourceFile(currentSourceFile);
    }

    if (isUrlLike(file)) {
        return file;
    }

    if (path.isAbsolute(file)) {
        return normalizeHelper(file);
    }

    if (currentSourceFile && !isUrlLike(currentSourceFile)) {
        return resolveHelper(path.dirname(currentSourceFile), file);
    }

    return normalizeHelper(file);
}

function createCanonicalRef(ref: string, currentSourceFile: string | undefined): { canonicalRef: string; sourceFile?: string; pointer?: string } {
    const parsed = parseRef(ref);
    const sourceFile = normalizeRefFile(parsed.file, currentSourceFile);
    const pointer = parsed.pointer;

    if (!sourceFile) {
        return { canonicalRef: pointer ?? ref, pointer };
    }

    return {
        canonicalRef: `${sourceFile}${pointer ?? ''}`,
        sourceFile,
        pointer,
    };
}

function decodeJsonPointerSegment(segment: string): string {
    return decodeURIComponent(segment).replace(/~1/g, '/').replace(/~0/g, '~');
}

function resolveJsonPointer(root: unknown, pointer: string | undefined): unknown {
    if (!pointer || pointer === '#') {
        return root;
    }

    if (!pointer.startsWith('#/')) {
        return undefined;
    }

    return pointer
        .slice(2)
        .split('/')
        .map(decodeJsonPointerSegment)
        .reduce<unknown>((current, segment) => {
            if (Array.isArray(current)) {
                const index = Number(segment);
                return Number.isInteger(index) ? current[index] : undefined;
            }

            if (isRecord(current)) {
                return current[segment];
            }

            return undefined;
        }, root);
}

function readRefFromResolver(refs: SemanticRefResolver | undefined, candidates: string[]): unknown {
    if (!refs) {
        return undefined;
    }

    for (const candidate of candidates) {
        try {
            if (refs.exists && !refs.exists(candidate)) {
                continue;
            }

            const value = refs.get(candidate);
            if (value !== undefined) {
                return value;
            }
        } catch {
            continue;
        }
    }

    return undefined;
}

function resolveRef(root: unknown, ref: string, currentSourceFile: string | undefined, options: ExpandOptions): RefTarget | null {
    const normalized = createCanonicalRef(ref, currentSourceFile);
    const candidates = [normalized.canonicalRef, ref];
    const resolvedFromRefs = readRefFromResolver(options.refs, [...new Set(candidates)]);

    if (resolvedFromRefs !== undefined) {
        return {
            canonicalRef: normalized.canonicalRef,
            sourceFile: normalized.sourceFile,
            value: resolvedFromRefs,
        };
    }

    const rootSourceFile = normalizeSourceFile(options.sourceFile);
    const isLocalRootRef = !normalized.sourceFile || normalized.sourceFile === rootSourceFile;
    if (isLocalRootRef) {
        const resolvedFromRoot = resolveJsonPointer(root, normalized.pointer);
        if (resolvedFromRoot !== undefined) {
            return {
                canonicalRef: normalized.canonicalRef,
                sourceFile: rootSourceFile,
                value: resolvedFromRoot,
            };
        }
    }

    return null;
}

function expandNode(root: unknown, node: unknown, currentSourceFile: string | undefined, options: ExpandOptions, refStack: Set<string>): unknown {
    if (Array.isArray(node)) {
        return node.map(item => expandNode(root, item, currentSourceFile, options, refStack));
    }

    if (!isRecord(node)) {
        return node;
    }

    const ref = node.$ref;
    if (typeof ref === 'string') {
        const target = resolveRef(root, ref, currentSourceFile, options);
        if (!target) {
            return { ...node };
        }

        if (refStack.has(target.canonicalRef)) {
            return { $ref: ref };
        }

        const nextStack = new Set(refStack);
        nextStack.add(target.canonicalRef);
        return expandNode(root, target.value, target.sourceFile ?? currentSourceFile, options, nextStack);
    }

    return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, expandNode(root, value, currentSourceFile, options, refStack)]));
}

/**
 * Строит клон спецификации с развёрнутыми refs для семантического сравнения.
 * Циклы и неразрешённые refs остаются стабильными `$ref`-объектами.
 * @param root корневой узел OpenAPI-документа
 * @param [options] опции резолва ссылок
 * @returns клон с развёрнутыми refs
 */
export function expandOpenApiRefsForSemanticDiff<T = unknown>(root: T, options: ExpandOptions = {}): T {
    const sourceFile = normalizeSourceFile(options.sourceFile);
    return expandNode(root, root, sourceFile, options, new Set<string>()) as T;
}
