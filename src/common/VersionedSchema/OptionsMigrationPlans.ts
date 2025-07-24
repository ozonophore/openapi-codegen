import { SchemaMigrationPlan } from "./Types";

/**
 * Migration plan for option models.
 */
export const optionsMigrationPlans: SchemaMigrationPlan<Record<string, any>, Record<string, any>>[] = [{
    fromVersion: '1.0.0',
    toVersion: '1.0.1',
    migrate: ({client, ...otherProps}) => ({ ...otherProps, httpClient: client })
}, {
    fromVersion: '1.0.1',
    toVersion: '2.0.0',
    migrate: (input) => ({ ...input, useCancelableRequest: false })
}];
