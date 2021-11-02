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

function gatheringRefs(context: Context, object: Record<string, any>, references: IRefWithtype[] = [], root: string = '', isSchema: boolean = false): IRefWithtype[] {
    if (object.$ref) {
        const newRef = object.$ref.match(/^(http:\/\/|https:\/\/)/g) ? object.$ref : object.$ref.match(/^(#\/)/g) ? join(root, object.$ref) : join(dirName(root), object.$ref);
        if (includes(references, newRef)) {
            return references;
        } else if (isSchema) {
            references.push({ value: newRef, type: TypeRef.SCHEMA });
        } else {
            references.push({ value: newRef, type: TypeRef.OTHERS });
        }
        const newObject = context.get(newRef);
        const newRoot = object.$ref.match(/^(http:\/\/|https:\/\/)/g) ? '' : object.$ref.match(/^(#\/)/g) ? root : join(dirName(root), object.$ref);
        return gatheringRefs(context, newObject as Record<string, any>, references, newRoot, isSchema);
    } else if (object.schema) {
        Object.values(object).forEach((value, index) => {
            if (value instanceof Object) {
                gatheringRefs(context, value, references, root, true);
            }
        });
    } else {
        Object.values(object).forEach((value, index) => {
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
