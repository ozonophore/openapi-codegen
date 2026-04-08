type JsonPathSegment = string | number;

export const toJsonPath = (segments: JsonPathSegment[]): string => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return segments.reduce((path, seg) => {
        const segment = String(seg);
        const needsBrackets =
            segment.includes('.') || segment.includes('/') || segment.includes('-') || segment.includes('[') || segment.includes(']');

        if (segment === '') {
            return path;
        }

        return path + (needsBrackets ? `['${segment}']` : `.${segment}`);
    }, '$');
};

const JSON_PATH_SEGMENT_REGEX = /\[['"]([^'"]+)['"]\]|\.([A-Za-z0-9_$]+)/g;

export const parseJsonPath = (path: string): string[] => {
    const segments: string[] = [];
    JSON_PATH_SEGMENT_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = JSON_PATH_SEGMENT_REGEX.exec(path)) !== null) {
        segments.push(match[1] ?? match[2]);
    }
    return segments.filter(segment => segment.length > 0);
};
