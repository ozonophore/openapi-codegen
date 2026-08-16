import { basename, extname } from 'path';

import { dirNameHelper, joinHelper } from '../../common/utils/pathHelpers';
import { getClassName } from './getClassName';
import { hasMappedType } from './getMappedType';
import { NON_MODEL_POINTER_PREFIXES } from './isModelCanonicalRef';

const SCHEMA_REGISTRY_POINTER_PREFIXES = ['#/components/schemas/', '#/definitions/'] as const;
const STRIP_NAMESPACE_PREFIXES = [...SCHEMA_REGISTRY_POINTER_PREFIXES, ...NON_MODEL_POINTER_PREFIXES];

function stripKnownPointerPrefix(value: string): string {
    for (const prefix of STRIP_NAMESPACE_PREFIXES) {
        if (value.startsWith(prefix)) {
            return value.slice(prefix.length);
        }
    }
    return value;
}

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
    const clearValue = stripKnownPointerPrefix(value.trim());

    const directoryName = dirNameHelper(clearValue);
    const baseName = getClassName(basename(clearValue));
    return directoryName ? joinHelper(directoryName, baseName) : baseName;
}
