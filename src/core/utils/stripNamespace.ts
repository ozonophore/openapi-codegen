import { basename, extname } from 'path';

import { dirNameHelper, joinHelper } from '../../common/utils/pathHelpers';
import { NON_MODEL_POINTER_PREFIXES } from './canonicalRef';
import { getClassName } from './getClassName';
import { hasMappedType } from './getMappedType';

/** Schema registry Pointers — naming only. Must not be on the Model denylist. */
const SCHEMA_REGISTRY_POINTER_PREFIXES = ['#/components/schemas/', '#/definitions/'] as const;

const NAMING_POINTER_PREFIXES = [...SCHEMA_REGISTRY_POINTER_PREFIXES, ...NON_MODEL_POINTER_PREFIXES];

function stripPointerPrefix(value: string): string {
    const prefix = NAMING_POINTER_PREFIXES.find(candidate => value.startsWith(candidate));
    return prefix ? value.slice(prefix.length) : value;
}

/**
 * Strip (OpenAPI) namespaces from values for getType naming.
 * This is not Model identity — `#/components/schemas/Item` and `#/components/requestBodies/Item`
 * both become `Item`.
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
    const clearValue = stripPointerPrefix(value.trim());

    const directoryName = dirNameHelper(clearValue);
    const baseName = getClassName(basename(clearValue));
    return directoryName ? joinHelper(directoryName, baseName) : baseName;
}
