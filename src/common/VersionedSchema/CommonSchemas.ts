import { z } from 'zod';

import { EmptySchemaStrategy } from '../../core/types/enums/EmptySchemaStrategy.enum';
import { ModelsMode } from '../../core/types/enums/ModelsMode.enum';
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

export const strictModeParametersSchema = z.object({
    strictOpenapi: z.boolean().optional(),
    reportFile: z.string().optional(),
})

/** Additional parameters */

export const additionalParametersSchema = z.object({
    clean: z.boolean().optional(),
    request: z.string().optional(),
    interfacePrefix: z.string().optional(),
    enumPrefix: z.string().optional(),
    typePrefix: z.string().optional(),
    useHistory: z.boolean().optional(),
    diffReport: z.string().optional(),
    modelsMode: z.enum(ModelsMode).optional(),
});

export const modelsConfigSchema = z.object({
    mode: z.enum(ModelsMode).optional(),
    corePath: z.string().optional(),
    modelsPath: z.string().optional(),
});

export const analyzeConfigSchema = z.object({
    reportPath: z.string().optional(),
    useHistory: z.boolean().optional(),
    ignore: z.array(z.object({
        path: z.string().optional(),
        pattern: z.string().optional(),
        reason: z.string().optional(),
        until: z.string().optional(),
    })).optional(),
    failOnBreaking: z.boolean().optional(),
});

export const miraclesConfigSchema = z.object({
    enabled: z.boolean().optional(),
    confidence: z.number().min(0).max(1).optional(),
    types: z.array(z.enum(['RENAME', 'TYPE_COERCION'])).optional(),
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
