import { createHash } from 'crypto';

import type { TStrictFlatOptions } from '../../common/TRawOptions';
import type { ArtifactKind, OptionsSlice } from './types';

const SCHEMA_HASH_KEYS = new Set(['type', 'properties', 'required', 'enum', 'items', 'allOf', 'oneOf', 'anyOf', 'format', 'nullable', 'additionalProperties', 'description']);

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function stableStringify(value: unknown): string {
    return JSON.stringify(normalizeForStringify(value));
}

function normalizeForStringify(value: unknown): JsonValue {
    if (value === null || value === undefined) {
        return null;
    }

    if (Array.isArray(value)) {
        return value.map(item => normalizeForStringify(item));
    }

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        const sortedKeys = Object.keys(record).sort();
        const normalized: Record<string, JsonValue> = {};

        for (const key of sortedKeys) {
            normalized[key] = normalizeForStringify(record[key]);
        }

        return normalized;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    return String(value);
}

export function hashFingerprint(value: string): string {
    return createHash('md5').update(value).digest('hex');
}

function normalizeSchemaNode(schema: unknown, rootSchema: Record<string, unknown>): unknown {
    if (!schema || typeof schema !== 'object') {
        return schema;
    }

    const node = schema as Record<string, unknown>;

    if (typeof node.$ref === 'string') {
        const resolved = resolveRef(node.$ref, rootSchema);
        if (resolved) {
            return normalizeSchemaNode(resolved, rootSchema);
        }
        return { $ref: node.$ref };
    }

    const normalized: Record<string, unknown> = {};

    for (const key of Object.keys(node).sort()) {
        if (!SCHEMA_HASH_KEYS.has(key)) {
            continue;
        }

        const value = node[key];

        if (key === 'properties' && value && typeof value === 'object' && !Array.isArray(value)) {
            const properties = value as Record<string, unknown>;
            const normalizedProperties: Record<string, unknown> = {};
            for (const propertyName of Object.keys(properties).sort()) {
                normalizedProperties[propertyName] = normalizeSchemaNode(properties[propertyName], rootSchema);
            }
            normalized[key] = normalizedProperties;
            continue;
        }

        if (Array.isArray(value)) {
            normalized[key] = value.map(item => normalizeSchemaNode(item, rootSchema));
            continue;
        }

        normalized[key] = value;
    }

    return normalized;
}

function resolveRef(ref: string, rootSchema: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!ref.startsWith('#/')) {
        return undefined;
    }

    const path = ref.slice(2).split('/');
    let current: unknown = rootSchema;

    for (const segment of path) {
        if (!current || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[segment];
    }

    if (!current || typeof current !== 'object') {
        return undefined;
    }

    return current as Record<string, unknown>;
}

const schemaHashMemo = new WeakMap<object, string>();

export function hashSchema(schema: Record<string, unknown>): string {
    const cached = schemaHashMemo.get(schema);
    if (cached) {
        return cached;
    }

    const rootSchema = schema.components && typeof schema.components === 'object' ? schema : { components: { schemas: { __root: schema } } };
    const normalized = normalizeSchemaNode(schema, rootSchema as Record<string, unknown>);
    const hash = hashFingerprint(stableStringify(normalized));
    schemaHashMemo.set(schema, hash);
    return hash;
}

export function buildOptionsSlice(options: TStrictFlatOptions): OptionsSlice {
    const pluginNames = (options.plugins ?? [])
        .map(plugin => {
            if (typeof plugin === 'string') {
                return plugin;
            }
            return typeof plugin === 'object' && plugin !== null && 'name' in plugin ? String((plugin as { name: string }).name) : '';
        })
        .filter(Boolean)
        .sort();

    return {
        validationLibrary: options.validationLibrary,
        useUnionTypes: options.useUnionTypes,
        interfacePrefix: options.interfacePrefix,
        enumPrefix: options.enumPrefix,
        typePrefix: options.typePrefix,
        modelsMode: options.modelsMode,
        sortByRequired: options.sortByRequired,
        emptySchemaStrategy: options.emptySchemaStrategy,
        useSeparatedIndexes: options.useSeparatedIndexes,
        httpClient: options.httpClient,
        prettierConfigPath: options.prettierConfigPath,
        pluginsHash: hashFingerprint(stableStringify(pluginNames)),
    };
}

export function buildOptionsSliceHash(optionsSlice: OptionsSlice): string {
    return hashFingerprint(stableStringify(optionsSlice));
}

export function buildArtifactKey(name: string, kind: ArtifactKind, schemaHash: string, optionsSliceHash: string): string {
    return hashFingerprint(`${schemaHash}|${name}|${kind}|${optionsSliceHash}`);
}
