import { SchemaMigrationPlan } from '../Types';
import { createDefaultFieldsMigration } from '../Utils/createDefaultFieldsMigration';

/**
 * Migration plan for multi options models.
 */
export const multiOptionsMigrationPlan: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [
    {
        fromVersion: 'v1',
        toVersion: 'v2',
        migrate: ({ client, ...otherProps }) => ({
            ...otherProps,
            httpClient: client,
        }),
    },
    createDefaultFieldsMigration('v2', 'v3', {
        useCancelableRequest: false,
    }),
    {
        fromVersion: 'v3',
        toVersion: 'v4',
        migrate: ({ items, input, output, outputCore, outputServices, outputModels, outputSchemas, ...otherProps }) => ({
            ...otherProps,
            items: items.map((el: any) => ({ ...el, input, output, outputCore, outputServices, outputModels, outputSchemas })),
        }),
    },
    createDefaultFieldsMigration('v4', 'v5', {
        excludeCoreServiceFiles: false,
        includeSchemasFiles: false,
        sortByRequired: false,
        useSeparatedIndexes: false,
    }),
];
