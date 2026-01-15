import { SchemaMigrationPlan } from '../Types';
import { createDefaultFieldsMigration } from '../Utils/createDefaultFieldsMigration';
import { createFieldTransformationMigration } from '../Utils/createFieldTransformationMigration';

/**
 * Migration plan for option models.
 */
export const optionsMigrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [
    createFieldTransformationMigration(
        'v1',
        'v2',
        ({ client, ...otherProps }) => ({ ...otherProps, httpClient: client }),
        'Renames client field to httpClient'
    ),
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
