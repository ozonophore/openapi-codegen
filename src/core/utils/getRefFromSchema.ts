import { Context } from '../Context';
import { TypeRef } from '../types/enums/TypeRef.enum';
import { getGatheringRefs } from './getGatheringRefs';

export function getRefFromSchema(context: Context, object: Record<string, any>): string[] {
    const references = getGatheringRefs(context, object);
    return references.filter(item => item.type === TypeRef.SCHEMA).map(value => value.value);
}
