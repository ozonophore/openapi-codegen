import { SchemaMigrationPlan } from './Types';

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
    {
        fromVersion: 'v2',
        toVersion: 'v3',
        migrate: oldVersion => ({
            ...oldVersion,
            useCancelableRequest: false,
        })
    },
    {
        fromVersion: 'v3',
        toVersion: 'v4',
        migrate: ({ items, input, output, outputCore, outputServices, outputModels, outputSchemas, ...otherProps }) => ({
            ...otherProps,
            items: items.map((el: any) => ({ ...el, input, output, outputCore, outputServices, outputModels, outputSchemas })),
        }),
    },
    {
        fromVersion: 'v4',
        toVersion: 'v5',
        migrate: oldVersion => ({
            ...oldVersion,
            useSeparatedIndexes: false,
        })
    }
];
