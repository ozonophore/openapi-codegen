import { z } from 'zod';

import { EmptySchemaStrategy } from '../../core/types/enums/EmptySchemaStrategy.enum';
import { ValidationLibrary } from '../../core/types/enums/ValidationLibrary.enum';

/** Output paths */

export const outputPathsSchema = z.object({
    output: z.string().min(1),
    outputCore: z.string().optional(),
    outputServices: z.string().optional(),
    outputModels: z.string().optional(),
    outputSchemas: z.string().optional(),
});

/** Special parameters */

const baseSpecialParametersSchema = z.object({
    useOptions: z.boolean().optional(),
    useUnionTypes: z.boolean().optional(),
});

export const specialParametersSchemas = z.object({
    ...baseSpecialParametersSchema.shape,
    exportCore: z.boolean().optional(),
    exportServices: z.boolean().optional(),
    exportModels: z.boolean().optional(),
    exportSchemas: z.boolean().optional(),
});

export const specialParametersSchemasV2 = z.object({
    ...baseSpecialParametersSchema.shape,
    excludeCoreServiceFiles: z.boolean().optional(),
    includeSchemasFiles: z.boolean().optional(),
});

export const specialParametersSchemasV3 = z.object({
    ...baseSpecialParametersSchema.shape,
    excludeCoreServiceFiles: z.boolean().optional(),
    validationLibrary: z.enum(ValidationLibrary).optional(),
});

export const specialParametersSchemasV4 = z.object({
    ...specialParametersSchemasV3.shape,
    emptySchemaStrategy: z.enum(EmptySchemaStrategy).optional(),
});

/** Additional parameters */

export const additionalParametersSchema = z.object({
    clean: z.boolean().optional(),
    request: z.string().optional(),
    interfacePrefix: z.string().optional(),
    enumPrefix: z.string().optional(),
    typePrefix: z.string().optional(),
});

export const additionalParametersSchemaV2 = additionalParametersSchema.omit({
    clean: true,
});

/** Experimental parameters */

export const experimentalParametersSchema = z.object({
    useCancelableRequest: z.boolean().optional(),
});

export const experimentalParametersSchemaV2 = z.object({
    ...experimentalParametersSchema.shape,
    sortByRequired: z.boolean().optional(),
    useSeparatedIndexes: z.boolean().optional(),
});
