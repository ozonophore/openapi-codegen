import { SchemaMigrationPlan } from "./Types";

/**
 * Migration plan for option models.
 */
export const optionsMigrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [{
    fromVersion: 'v1',
    toVersion: 'v2',
    migrate: ({client, ...otherProps}) => ({ ...otherProps, httpClient: client })
}, {
    fromVersion: 'v2',
    toVersion: 'v3',
    migrate: (input) => ({ ...input, useCancelableRequest: false })
}, {
    fromVersion: 'v3',
    toVersion: 'v4',
    migrate: (input) => ({ ...input, useSeparatedIndexes: false })
}];
