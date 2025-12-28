import { REGEX_BACKSLASH, REGEX_DOT_SLASH, REGEX_LEADING_DOT_SLASH, REGEX_MULTIPLE_SLASHES } from '../types/Consts';

export function normalizeString(value?: string): string | null | undefined {
    if (!value) {
        return value;
    }

    return value
        .replace(REGEX_BACKSLASH, '/')
        .replace(REGEX_MULTIPLE_SLASHES, '/')
        .replace(REGEX_DOT_SLASH, '/')
        .replace(REGEX_LEADING_DOT_SLASH, './');
}
