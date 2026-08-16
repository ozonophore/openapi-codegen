import { REGEX_BACKSLASH } from '../types/Consts';

export function isRemoteOrFileUrl(value: string): boolean {
    return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('file:');
}

/**
 * Comparison spelling for a `$Refs` parser key (file or file#Pointer).
 * Folds slashes, percent-encoding, and drive-letter case. Not `path.resolve`.
 */
export function internParserKey(fileOrRef: string): string {
    let value = fileOrRef;
    try {
        value = decodeURI(value);
    } catch {
        // keep original if malformed percent-encoding
    }
    value = value.replace(REGEX_BACKSLASH, '/');
    if (isRemoteOrFileUrl(value)) {
        return value;
    }
    value = value.replace(/^([a-zA-Z]):/, (_, letter: string) => `${letter.toUpperCase()}:`);
    if (value.startsWith('//')) {
        return value;
    }
    return value.replace(/\/{2,}/g, '/');
}

export function internParserKeysEqual(left: string, right: string): boolean {
    return internParserKey(left) === internParserKey(right);
}

/**
 * Return the parser's own key spelling when it intern-matches `candidate`.
 */
export function findInternParserKey(parserKeys: readonly string[], candidate: string): string | undefined {
    if (!candidate) {
        return undefined;
    }
    if (parserKeys.includes(candidate)) {
        return candidate;
    }
    const target = internParserKey(candidate);
    return parserKeys.find(key => internParserKey(key) === target);
}
