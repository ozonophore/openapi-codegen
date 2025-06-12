import { dirName, join } from '../utils/pathHelpers';

export function getAbsolutePath(definitionRef: string | undefined, parentRef: string): string {
    // If the definition Ref is missing
    if (!definitionRef) {
        return parentRef.startsWith('#/') ? '' : parentRef;
    }

    if (definitionRef.startsWith('#/')) {
        // If definitionRef is an absolute reference (#/), replace the part after # in parentRef.
        const basePath = parentRef.split('#')[0]; // We take everything up to #
        return `${basePath}${definitionRef}`;
    }

    if (parentRef.startsWith('#/')) {
        // If parentRef is an absolute reference, we return definitionRef as it is.
        return definitionRef;
    }

    return join(dirName(parentRef), definitionRef);
}
