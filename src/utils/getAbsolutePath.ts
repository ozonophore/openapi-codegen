import { dirName, join } from './path';

export function getAbsolutePath(definitionRef: string | undefined, parentRef: string): string {
    if (definitionRef) {
        if (parentRef && parentRef.match(/^(#\/)/g)) {
            return definitionRef;
        } else if (definitionRef.match(/^(#\/)/g)) {
            return `${parentRef}${definitionRef}`;
        }
        return join(dirName(parentRef), definitionRef);
    }
    if (parentRef.match(/^(#\/)/g)) {
        return '';
    }
    return parentRef;
}
