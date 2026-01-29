import { EVersionedSchemaType } from '../../Enums';
import { CompatibilityIssue } from '../compareShapes';

type CompatibilityCase = {
    type: EVersionedSchemaType;
    from: string;
    to: string;
    expect: CompatibilityIssue[];
};

/**
 * ВАЖНО!
 * Для корректной работы механизма миграции версий опций необходимо после добавления
 * новой схемы обновлять compatibilityCases.
 */
export const compatibilityCases: CompatibilityCase[] = [
    {
        type: EVersionedSchemaType.OPTIONS,
        from: 'v1',
        to: 'v2',
        expect: [
            { type: 'removed', key: 'client' },
            { type: 'added', key: 'httpClient' },
        ],
    },
    {
        type: EVersionedSchemaType.OPTIONS,
        from: 'v2',
        to: 'v3',
        expect: [{ type: 'added', key: 'useCancelableRequest' }],
    },
    {
        type: EVersionedSchemaType.OPTIONS,
        from: 'v3',
        to: 'v4',
        expect: [
            { type: 'removed', key: 'exportCore' },
            { type: 'removed', key: 'exportServices' },
            { type: 'removed', key: 'exportModels' },
            { type: 'removed', key: 'exportSchemas' },
            { type: 'removed', key: 'clean' },
            { type: 'added', key: 'excludeCoreServiceFiles' },
            { type: 'added', key: 'includeSchemasFiles' },
            { type: 'added', key: 'sortByRequired' },
            { type: 'added', key: 'useSeparatedIndexes' },
        ],
    },
    {
        type: EVersionedSchemaType.MULTI_OPTIONS,
        from: 'v1',
        to: 'v2',
        expect: [
            { type: 'removed', key: 'client' },
            { type: 'added', key: 'httpClient' },
        ],
    },
    {
        type: EVersionedSchemaType.MULTI_OPTIONS,
        from: 'v2',
        to: 'v3',
        expect: [{ type: 'added', key: 'useCancelableRequest' }],
    },
    {
        type: EVersionedSchemaType.MULTI_OPTIONS,
        from: 'v4',
        to: 'v5',
        expect: [
            { type: 'removed', key: 'exportCore' },
            { type: 'removed', key: 'exportServices' },
            { type: 'removed', key: 'exportModels' },
            { type: 'removed', key: 'exportSchemas' },
            { type: 'removed', key: 'clean' },
            { type: 'added', key: 'excludeCoreServiceFiles' },
            { type: 'added', key: 'includeSchemasFiles' },
            { type: 'added', key: 'sortByRequired' },
            { type: 'added', key: 'useSeparatedIndexes' },
        ],
    },
    {
        type: EVersionedSchemaType.UNIFIED_OPTIONS,
        from: 'v1',
        to: 'v2',
        expect: [{ type: 'added', key: 'validationLibrary' }],
    },
    {
        type: EVersionedSchemaType.UNIFIED_OPTIONS,
        from: 'v2',
        to: 'v3',
        expect: [{ type: 'added', key: 'logLevel' }, { type: 'added', key: 'logTarget' }],
    },
];
