import { dirName, join } from '../core/path';

export function getAbsolutePath(definitionRef: string | undefined, parentRef: string): string {
    if (!definitionRef) {
        return parentRef.match(/^(#\/)/) ? '' : parentRef;
    }

    if (parentRef.match(/^(#\/)/)) {
        return definitionRef;
    }

    let basePath = parentRef;

    // If parentRef contains a `#`, we trim everything that comes after the first `#`
    const hashIndex = parentRef.indexOf('#');
    if (hashIndex !== -1) {
        basePath = parentRef.slice(0, hashIndex);
    }

    let absolutePath: string;

    if (definitionRef.match(/^(#\/)/)) {
        // If the definitionRef starts with `#/`, attach it to the basePath
        absolutePath = `${basePath}${definitionRef}`;
    } else {
        // If definitionRef is a relative path
        absolutePath = join(dirName(basePath), definitionRef);
    }

    return absolutePath;
}
