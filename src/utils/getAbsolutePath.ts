import { dirName, join } from '../core/path';

export function getAbsolutePath(definitionRef: string | undefined, parentRef: string): string {
    if (!definitionRef) {
        return parentRef.match(/^(#\/)/) ? '' : parentRef;
    }

    if (parentRef.match(/^(#\/)/)) {
        return definitionRef;
    }

    let basePath = parentRef;

    // Если parentRef содержит `#`, обрезаем всё, что идёт после первого `#`
    const hashIndex = parentRef.indexOf('#');
    if (hashIndex !== -1) {
        basePath = parentRef.slice(0, hashIndex);
    }

    let absolutePath: string;

    if (definitionRef.match(/^(#\/)/)) {
        // Если definitionRef начинается с `#/`, присоединяем его к basePath
        absolutePath = `${basePath}${definitionRef}`;
    } else {
        // Если definitionRef — относительный путь
        absolutePath = join(dirName(basePath), definitionRef);
    }

    return absolutePath;
}
