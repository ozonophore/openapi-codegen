import { dirNameHelper, joinHelper } from '../../common/utils/pathHelpers';

export function getAbsolutePath(definitionRef: string | undefined, parentRef: string): string {
    // If the definition Ref is missing
    if (!definitionRef) {
        return parentRef.startsWith('#/') ? '' : parentRef;
    }

    const parentBase = parentRef.split('#')[0] || '';

    // If definitionRef is an absolute fragment, attach to parent base
    if (definitionRef.startsWith('#/')) {
        return `${parentBase}${definitionRef}`;
    }

    // If parentRef is only a fragment, keep definitionRef as is
    if (parentRef.startsWith('#/')) {
        return definitionRef;
    }

    // Full URL or absolute filesystem path → return as is
    if (/^https?:\/\//i.test(definitionRef) || definitionRef.startsWith('/')) {
        return definitionRef;
    }

    // If definitionRef already has its own fragment and/or relative path
    if (definitionRef.includes('#')) {
        const [defPath, defFrag] = definitionRef.split('#');
        const absPath = defPath ? joinHelper(dirNameHelper(parentBase), defPath) : parentBase;
        return defFrag ? `${absPath}#${defFrag}` : absPath;
    }

    // Plain relative path → resolve against parent base directory
    return joinHelper(dirNameHelper(parentBase), definitionRef);
}
