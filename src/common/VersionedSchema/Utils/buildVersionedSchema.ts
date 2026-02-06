import { z } from 'zod';

import { EVersionedSchemaType } from '../Enums';
import { VersionedSchema } from '../Types';

type BuildVersionedSchemaParams<TBase extends z.ZodObject<any>> = {
    base: TBase;
    refine?: (data: z.infer<TBase>, ctx: z.RefinementCtx) => void;
    version: string;
    type: EVersionedSchemaType;
};

export function buildVersionedSchema<TBase extends z.ZodObject<any>>(
    params: BuildVersionedSchemaParams<TBase>
): VersionedSchema<z.ZodTypeAny> {
    const { base, refine, version, type } = params;

    const schema = refine ? base.superRefine(refine) : base;

    return {
        schema,
        baseSchema: base,
        version,
        type,
    };
}
