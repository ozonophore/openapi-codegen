import equal from 'fast-deep-equal';

import { Context } from '../core/Context';
import { dirName, join } from '../core/path';

enum TypeRef {
    SCHEMA,
    OTHERS,
}

interface IRefWithtype {
    value: string;
    type: TypeRef;
}

function includes(references: IRefWithtype[], value: string): boolean {
    return references.findIndex(item => equal(item.value, value)) !== -1;
}

function extractBasePath(path: string): string {
    // Extracting the base path to the last `#`
    return path.includes('#') ? path.split('#')[0] : path;
}

function gatheringRefs(context: Context, object: Record<string, any>, references: IRefWithtype[] = [], root: string = '', isSchema: boolean = false): IRefWithtype[] {
    if (object.$ref) {
        // Extracting the base path from root
        const baseRoot = extractBasePath(root);

        // Creating a newRef
        let newRef = object.$ref.match(/^(http:\/\/|https:\/\/)/) ? object.$ref : object.$ref.match(/^(#\/)/) ? join(baseRoot, object.$ref) : join(dirName(baseRoot), object.$ref);

        // Remove the extra '/' before the '#' if there is one.
        if (newRef.includes('#/')) {
            newRef = newRef.replace(/\/#/, '#');
        }

        // Checking for a link in `references`
        if (includes(references, newRef)) {
            return references;
        }

        // We add a link depending on the type.
        references.push({
            value: newRef,
            type: isSchema ? TypeRef.SCHEMA : TypeRef.OTHERS,
        });

        // Getting an object using a new path
        const newObject = context.get(newRef);

        // Updating the `root` for nested calls
        let newRoot = object.$ref.match(/^(http:\/\/|https:\/\/)/) ? '' : object.$ref.match(/^(#\/)/) ? baseRoot : join(dirName(baseRoot), object.$ref);

        // Remove the extra '/' before the '#' if there is one.
        if (newRoot.includes('#/')) {
            newRoot = newRoot.replace(/\/#/, '#');
        }

        return gatheringRefs(context, newObject as Record<string, any>, references, newRoot, isSchema);
    } else if (object.schema) {
        Object.values(object).forEach(value => {
            if (value instanceof Object) {
                gatheringRefs(context, value, references, root, true);
            }
        });
    } else {
        Object.values(object).forEach(value => {
            if (value instanceof Object) {
                gatheringRefs(context, value, references, root, isSchema);
            }
        });
    }

    return references;
}

export function getRefFromSchema(context: Context, object: Record<string, any>): string[] {
    const references = gatheringRefs(context, object);
    return references.filter(item => item.type === TypeRef.SCHEMA).map(value => value.value);
}
