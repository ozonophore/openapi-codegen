import { basename, extname } from 'path';

import { dirNameHelper, joinHelper } from '../../common/utils/pathHelpers';
import { getClassName } from './getClassName';
import { hasMappedType } from './getMappedType';
import { NON_MODEL_POINTER_PREFIXES } from './isModelPointer';

/** Naming prefixes only. Schema registries are Models; they are not on the Model denylist. */
const STRIP_NAMESPACE_POINTER_PREFIXES = ['#/components/schemas/', '#/definitions/', ...NON_MODEL_POINTER_PREFIXES];

/**
 * Strip (OpenAPI) namespaces fom values.
 * @param value
 */
export function stripNamespace(value: string): string {
    if (!value || hasMappedType(value)) {
        return value;
    }
    if (!value.match(/^(http:\/\/|https:\/\/|#\/)/g) && !hasMappedType(value) && !value.match(/^array\[[a-z]+\]$/g)) {
        const foundFile = value.match(/^(.*)#/);
        const directoryName = foundFile ? dirNameHelper(foundFile[1]) : dirNameHelper(value);

        const extName = extname(value);
        const baseName = extName ? getClassName(basename(value, extName)) : getClassName(basename(value));
        return directoryName ? joinHelper(directoryName, baseName) : baseName;
    }
    let clearValue = value.trim();
    for (const prefix of STRIP_NAMESPACE_POINTER_PREFIXES) {
        if (clearValue.startsWith(prefix)) {
            clearValue = clearValue.slice(prefix.length);
            break;
        }
    }

    const directoryName = dirNameHelper(clearValue);
    const baseName = getClassName(basename(clearValue));
    return directoryName ? joinHelper(directoryName, baseName) : baseName;
}
