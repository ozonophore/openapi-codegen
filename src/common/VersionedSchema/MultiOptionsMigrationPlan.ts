import { SchemaMigrationPlan } from './Types';

/**
 * Migration plan for multi options models.
 */
export const multiOptionsMigrationPlan: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [
    {
        fromVersion: '1.0.0',
        toVersion: '1.0.1',
        migrate: ({ client, ...otherProps }) => ({
            ...otherProps,
            httpClient: client,
        }),
    },
    {
        fromVersion: '1.0.1',
        toVersion: '1.0.2',
        migrate: oldVersion => ({
            ...oldVersion,
            useCancelableRequest: false,
        })
    },
    {
        fromVersion: '1.0.2',
        toVersion: '2.0.0',
        migrate: ({ items, input, output, outputCore, outputServices, outputModels, outputSchemas, ...otherProps }) => ({
            ...otherProps,
            items: items.map((el: any) => ({ ...el, input, output, outputCore, outputServices, outputModels, outputSchemas })),
        }),
    },
];
