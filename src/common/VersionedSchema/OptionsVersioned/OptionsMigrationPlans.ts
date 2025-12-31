import { SchemaMigrationPlan } from '../Types';
import { createDefaultFieldsMigration } from '../Utils/createDefaultFieldsMigration';

/**
 * Migration plan for option models.
 */
export const optionsMigrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [
    {
        fromVersion: 'v1',
        toVersion: 'v2',
        migrate: ({ client, ...otherProps }) => ({ ...otherProps, httpClient: client }),
    },
    createDefaultFieldsMigration('v2', 'v3', {
        useCancelableRequest: false,
    }),
    createDefaultFieldsMigration('v3', 'v4', {
        excludeCoreServiceFiles: false,
        includeSchemasFiles: false,
        sortByRequired: false,
        useSeparatedIndexes: false,
    }),
];
