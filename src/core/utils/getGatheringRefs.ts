import equal from 'fast-deep-equal';

import { Context } from '../Context';
import { TypeRef } from '../types/Enums';
import { IRefWithtype } from '../types/Models';
import { dirName, join } from '../utils/pathHelpers';

function includes(references: IRefWithtype[], value: string): boolean {
    return references.findIndex(item => equal(item.value, value)) !== -1;
}

function extractBasePath(path: string): string {
    // Extracting the base path to the last `#`
    return path.includes('#') ? path.split('#')[0] : path;
}

export function getGatheringRefs(context: Context, object: Record<string, any>, references: IRefWithtype[] = [], root: string = '', isSchema: boolean = false): IRefWithtype[] {
    // If the object is not valid, we return the links
    if (!object || typeof object !== 'object') {
        return references;
    }

    if (object.$ref) {
        const isAbsoluteRef = object.$ref.startsWith('#/');
        const isHttpRef = object.$ref.startsWith('http://') || object.$ref.startsWith('https://');
        // Extracting the base path from root
        const baseRoot = extractBasePath(root);

        let newRef = isHttpRef ? object.$ref : isAbsoluteRef ? join(baseRoot, object.$ref) : join(dirName(baseRoot), object.$ref);
        // Remove the extra '/' before the '#' if there is one.
        if (newRef.includes('#/')) {
            newRef = newRef.replace(/\/#/, '#');
        }

        if (includes(references, newRef)) {
            return references;
        }

        references.push({ value: newRef, type: isSchema ? TypeRef.SCHEMA : TypeRef.OTHERS });

        const newObject = context.get(newRef);
        let newRoot = isHttpRef ? '' : isAbsoluteRef ? baseRoot : join(dirName(baseRoot), object.$ref);
        // Remove the extra '/' before the '#' if there is one.
        if (newRoot.includes('#/')) {
            newRoot = newRoot.replace(/\/#/, '#');
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
