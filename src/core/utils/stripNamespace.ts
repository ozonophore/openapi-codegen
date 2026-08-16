import { basename, extname } from 'path';

import { dirNameHelper, joinHelper } from '../../common/utils/pathHelpers';
import { getClassName } from './getClassName';
import { hasMappedType } from './getMappedType';
import { NON_SCHEMA_COMPONENT_POINTER_PREFIXES } from './parseRef';

const SCHEMA_REGISTRY_POINTER_PREFIXES = ['#/components/schemas/', '#/definitions/'] as const;

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
    for (const prefix of [...SCHEMA_REGISTRY_POINTER_PREFIXES, ...NON_SCHEMA_COMPONENT_POINTER_PREFIXES]) {
        if (clearValue.startsWith(prefix)) {
            clearValue = clearValue.slice(prefix.length);
            break;
        }
    }

    const directoryName = dirNameHelper(clearValue);
    const baseName = getClassName(basename(clearValue));
    return directoryName ? joinHelper(directoryName, baseName) : baseName;
}
