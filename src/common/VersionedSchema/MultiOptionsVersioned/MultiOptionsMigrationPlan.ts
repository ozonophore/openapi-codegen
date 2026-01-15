import { SchemaMigrationPlan } from '../Types';
import { createDefaultFieldsMigration } from '../Utils/createDefaultFieldsMigration';
import { createFieldTransformationMigration } from '../Utils/createFieldTransformationMigration';

/**
 * Migration plan for multi options models.
 */
export const multiOptionsMigrationPlan: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [
    createFieldTransformationMigration(
        'v1',
        'v2',
        ({ client, ...otherProps }) => ({
            ...otherProps,
            httpClient: client,
        }),
        'Renames client field to httpClient'
    ),
    createDefaultFieldsMigration('v2', 'v3', {
        useCancelableRequest: false,
    }),
    createFieldTransformationMigration(
        'v3',
        'v4',
        ({ items, input, output, outputCore, outputServices, outputModels, outputSchemas, ...otherProps }) => ({
            ...otherProps,
            items: items.map((el: any) => ({ ...el, input, output, outputCore, outputServices, outputModels, outputSchemas })),
        }),
        'Moves input, output, and output paths from root level into each item in the items array'
    ),
    createDefaultFieldsMigration('v4', 'v5', {
        excludeCoreServiceFiles: false,
        includeSchemasFiles: false,
        sortByRequired: false,
        useSeparatedIndexes: false,
    }),
];
