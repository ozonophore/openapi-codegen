import equal from 'fast-deep-equal';

import { Context } from '../Context';
import { RefWithType } from '../types/base/RefWithtype.model';
import { TypeRef } from '../types/enums/TypeRef.enum';
import { normalizeRef } from './normalizeRef';
import { parseRef } from './parseRef';
import { resolveRefPath } from './resolveRefPath';

function includes(references: RefWithType[], value: string): boolean {
    return references.findIndex(item => equal(item.value, value)) !== -1;
}

function extractBasePath(path: string): string {
    // Extracting the base path to the last `#`
    return path.includes('#') ? path.split('#')[0] : path;
}

export function getGatheringRefs(context: Context, object: Record<string, any>, references: RefWithType[] = [], root: string = '', isSchema: boolean = false): RefWithType[] {
    // If the object is not valid, we return the links
    if (!object || typeof object !== 'object') {
        return references;
    }

    if (object.$ref) {
        // Parse the reference to understand its type
        const baseRoot = extractBasePath(root);
        const parsedRef = parseRef(object.$ref);
        
        // Create normalized reference for context.get
        const normalizedRef = normalizeRef(object.$ref, baseRoot);

        if (includes(references, normalizedRef)) {
            return references;
        }

        references.push({ value: normalizedRef, type: isSchema ? TypeRef.SCHEMA : TypeRef.OTHERS });

        const newObject = context.get(normalizedRef);
        
        // For recursive processing, determine the correct root path
        let newRoot: string;
        if (parsedRef.type === 'local_fragment') {
            // For local fragments, keep the same root
            newRoot = baseRoot;
        } else if (parsedRef.type === 'external_file' || parsedRef.type === 'external_file_fragment') {
            // For external files, use the resolved file path
            const resolvedPath = resolveRefPath(parsedRef, baseRoot);
            newRoot = resolvedPath;
        } else {
            // For other types, use the normalized path without fragment
            const [filePath] = normalizedRef.split('#');
            newRoot = filePath;
        }

        return getGatheringRefs(context, newObject as Record<string, any>, references, newRoot, isSchema);
    } else if (object.schema) {
        Object.values(object).forEach(value => {
            if (value instanceof Object) {
                getGatheringRefs(context, value, references, root, true);
            }
        });
    } else {
        Object.values(object).forEach(value => {
            if (value instanceof Object) {
                getGatheringRefs(context, value, references, root, isSchema);
            }
        });
    }

    return references;
}
