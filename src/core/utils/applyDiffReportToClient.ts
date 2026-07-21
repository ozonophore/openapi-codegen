import { parseJsonPath } from '../../common/utils/jsonPath';
import type { Context } from '../Context';
import type { PrefixArtifacts } from '../types/base/PrefixArtifacts.model';
import type { Client } from '../types/shared/Client.model';
import type { DiffInfo } from '../types/shared/DiffInfo.model';
import type { MiracleEntry } from '../types/shared/Miracle.model';
import type { Model } from '../types/shared/Model.model';
import type { Operation } from '../types/shared/Operation.model';
import type { OperationParameter } from '../types/shared/OperationParameter.model';
import type { Service } from '../types/shared/Service.model';
import { encode } from './encode';
import { escapeName } from './escapeName';
import { getClassName } from './getClassName';
import { getComment } from './getComment';
import { getModelNameWithPrefix } from './getModelNameWithPrefix';
import { OpenApiVersion } from './getOpenApiVersion';
import { getOperationName } from './getOperationName';
import { getOperationParameterName } from './getOperationParameterName';
import { getOperationPath } from './getOperationPath';
import { getServiceClassName } from './getServiceClassName';
import type { DiffReport, DiffReportEntry } from './loadDiffReport';
import { ensureService } from './serviceHelpers';

type MiraclesConfig = {
    enabled?: boolean;
    confidence?: number;
    types?: Array<'RENAME' | 'TYPE_COERCION'>;
};

type ApplyDiffParams = {
    client: Client;
    openApi: Record<string, unknown>;
    openApiVersion: OpenApiVersion;
    diffReport: DiffReport | null;
    prefix: PrefixArtifacts;
    context?: Context;
    miraclesConfig?: MiraclesConfig;
};

const passesMiraclesConfigFilter = (miracle: MiracleEntry, miraclesConfig?: MiraclesConfig): boolean => {
    if (!miraclesConfig) {
        return true;
    }
    if (miraclesConfig.enabled === false) {
        return false;
    }
    if (miraclesConfig.types && miraclesConfig.types.length > 0 && !miraclesConfig.types.includes(miracle.type as 'RENAME' | 'TYPE_COERCION')) {
        return false;
    }
    if (miracle.status === 'confirmed') {
        return true;
    }
    if (typeof miraclesConfig.confidence === 'number') {
        return (miracle.confidence ?? 0) >= miraclesConfig.confidence;
    }
    return true;
};

type OperationMatch = {
    key: string;
    path: string;
    method: string;
    entry: DiffReportEntry;
};

const getSchemaDefinitions = (openApi: Record<string, unknown>, version: OpenApiVersion): Record<string, unknown> => {
    if (version === OpenApiVersion.V3) {
        const components = openApi?.components as Record<string, unknown> | undefined;
        const schemas = components?.schemas as Record<string, unknown> | undefined;
        return schemas ?? {};
    }
    const definitions = openApi?.definitions as Record<string, unknown> | undefined;
    return definitions ?? {};
};

const buildLocalSchemaRef = (schemaName: string, version: OpenApiVersion): string => (version === OpenApiVersion.V3 ? `#/components/schemas/${schemaName}` : `#/definitions/${schemaName}`);

const resolveSchemaDefinition = (schemaName: string, schemaDef: unknown, version: OpenApiVersion, context?: Context): unknown => {
    if (context) {
        try {
            const resolved = context.get(buildLocalSchemaRef(schemaName, version));
            if (resolved && typeof resolved === 'object') {
                return resolved;
            }
        } catch {
            // fallback to raw schemaDef
        }
    }
    return schemaDef;
};

const buildSchemaNameMap = (openApi: Record<string, unknown>, version: OpenApiVersion, prefix: PrefixArtifacts, context?: Context): Map<string, string> => {
    const definitions = getSchemaDefinitions(openApi, version);
    const map = new Map<string, string>();

    Object.entries(definitions).forEach(([schemaName, schemaDef]) => {
        const resolvedDef = resolveSchemaDefinition(schemaName, schemaDef, version, context);
        const encodedName = encode(schemaName);
        const modelName = getModelNameWithPrefix(encodedName, resolvedDef, prefix);
        map.set(schemaName, modelName);
    });

    return map;
};

const getSchemaNameFromSegments = (segments: string[], version: OpenApiVersion): string | null => {
    if (version === OpenApiVersion.V3) {
        return segments[0] === 'components' && segments[1] === 'schemas' ? (segments[2] ?? null) : null;
    }
    return segments[0] === 'definitions' ? (segments[1] ?? null) : null;
};

const describeSchemaType = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
        return value;
    }

    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (typeof record.$ref === 'string') {
            return `ref:${record.$ref}`;
        }
        if (typeof record.type === 'string') {
            return record.type;
        }
        if (Array.isArray(record.oneOf)) {
            return 'oneOf';
        }
        if (Array.isArray(record.anyOf)) {
            return 'anyOf';
        }
        if (Array.isArray(record.allOf)) {
            return 'allOf';
        }
    }

    return undefined;
};

const normalizeScalarType = (value?: string): string | undefined => {
    if (!value) return undefined;
    const normalized = value.toLowerCase();
    if (normalized === 'int' || normalized === 'integer') return 'number';
    if (normalized === 'float' || normalized === 'double') return 'number';
    if (normalized === 'string') return 'string';
    if (normalized === 'number') return 'number';
    if (normalized === 'boolean') return 'boolean';
    return undefined;
};

const mergeOperationDiff = (existing: DiffInfo | undefined, entry: DiffReportEntry): DiffInfo => {
    if (!existing) {
        return {
            action: entry.action,
            path: entry.path,
            severity: entry.severity,
            from: entry.from,
            to: entry.to,
        };
    }

    const severityOrder = ['info', 'warning', 'breaking'];
    const existingScore = severityOrder.indexOf(existing.severity);
    const incomingScore = severityOrder.indexOf(entry.severity);
    const severity = incomingScore > existingScore ? entry.severity : existing.severity;

    return {
        ...existing,
        severity,
    };
};

const normalizeOperationPathForKey = (path: string): string =>
    path.replace(/\$\{([^}]+)\}/g, '{$1}').replace(/\{([^}]+)\}/g, (substring, name) => (substring === '{api-version}' ? substring : `{${name}}`));

const buildOperationKey = (method: string, path: string): string => `${method.toUpperCase()} ${normalizeOperationPathForKey(path)}`;

const createGhostPathParameters = (path: string): OperationParameter[] => {
    const parameters: OperationParameter[] = [];
    const pattern = /\{([^}]+)\}/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(path)) !== null) {
        const prop = match[1];
        if (prop === 'api-version') {
            continue;
        }

        const name = getOperationParameterName(prop);
        parameters.push({
            in: 'path',
            prop,
            name,
            alias: '',
            path: '',
            export: 'generic',
            type: 'string',
            base: 'string',
            template: null,
            link: null,
            description: null,
            isDefinition: false,
            isReadOnly: false,
            isRequired: true,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
            mediaType: null,
        });
    }

    return parameters;
};

const findOperationMatches = (entries: DiffReportEntry[]): { operationDiffs: Map<string, DiffInfo>; removedOperations: OperationMatch[] } => {
    const operationDiffs = new Map<string, DiffInfo>();
    const removedOperations: OperationMatch[] = [];

    entries.forEach(entry => {
        const segments = parseJsonPath(entry.path);
        if (segments[0] !== 'paths' || segments.length < 3) {
            return;
        }

        const rawPath = segments[1];
        const method = segments[2];
        const key = buildOperationKey(method, rawPath);

        if (entry.action === 'removed' && segments.length === 3) {
            removedOperations.push({
                key,
                path: rawPath,
                method,
                entry,
            });
            return;
        }

        operationDiffs.set(key, mergeOperationDiff(operationDiffs.get(key), entry));
    });

    return { operationDiffs, removedOperations };
};

const createGhostOperation = (match: OperationMatch, serviceName: string): Operation => {
    const from = (match.entry.from ?? {}) as Record<string, unknown>;
    const operationId = typeof from.operationId === 'string' ? from.operationId : '';
    const summary = typeof from.summary === 'string' ? from.summary : '';
    const description = typeof from.description === 'string' ? from.description : '';
    const operationNameFallback = `${match.method}${serviceName}`;
    const operationName = getOperationName(operationId || operationNameFallback);

    const pathParameters = createGhostPathParameters(match.path);

    return {
        service: serviceName,
        name: operationName,
        summary: getComment(summary),
        description: getComment(description),
        deprecated: true,
        method: match.method.toUpperCase(),
        path: getOperationPath(match.path),
        parameters: pathParameters,
        parametersPath: pathParameters,
        parametersQuery: [],
        parametersForm: [],
        parametersHeader: [],
        parametersCookie: [],
        parametersBody: null,
        imports: [],
        errors: [],
        results: [],
        responseHeader: null,
        responseType: null,
        diff: {
            action: 'removed',
            path: match.entry.path,
            severity: match.entry.severity,
            from: match.entry.from,
            to: match.entry.to,
        },
        isGhost: true,
    };
};

const resolveServiceFromMatch = (services: Map<string, Service>, match: OperationMatch): Service => {
    const from = (match.entry.from ?? {}) as Record<string, unknown>;
    const tagsValue = from.tags;
    const tag = Array.isArray(tagsValue) ? String(tagsValue[0] ?? '') : '';
    const preferredName = tag ? getServiceClassName(tag) : getServiceClassName('Default');
    const preferredOrigin = tag ? getClassName(tag) : getClassName('Default');

    const existingByName = services.get(preferredName);
    if (existingByName) {
        return existingByName;
    }

    const existingByOrigin = Array.from(services.values()).find(service => service.originName === preferredOrigin);
    if (existingByOrigin) {
        return existingByOrigin;
    }

    return ensureService(services, preferredName, preferredOrigin);
};

const applyOperationDiffs = (client: Client, entries: DiffReportEntry[]): void => {
    const { operationDiffs, removedOperations } = findOperationMatches(entries);
    const servicesMap = new Map<string, Service>(client.services.map(service => [service.name, service]));

    for (const service of servicesMap.values()) {
        for (const operation of service.operations) {
            const key = buildOperationKey(operation.method, operation.path);
            const diff = operationDiffs.get(key);
            if (diff) {
                operation.diff = diff;
            }
        }
    }

    for (const match of removedOperations) {
        const service = resolveServiceFromMatch(servicesMap, match);
        const ghostOperation = createGhostOperation(match, service.name);
        const existingOperation = service.operations.find(op => buildOperationKey(op.method, op.path) === match.key);
        if (!existingOperation) {
            service.operations.push(ghostOperation);
        }
    }

    client.services = Array.from(servicesMap.values());
};

const buildModelsByName = (models: Model[]): Map<string, Model[]> => {
    const modelsByName = new Map<string, Model[]>();
    models.forEach(model => {
        const list = modelsByName.get(model.name) ?? [];
        list.push(model);
        modelsByName.set(model.name, list);
    });
    return modelsByName;
};

const getModelsForSchema = (schemaName: string, schemaNameMap: Map<string, string>, modelsByName: Map<string, Model[]>): Model[] => {
    const modelName = schemaNameMap.get(schemaName);
    if (!modelName) return [];
    return modelsByName.get(modelName) ?? [];
};

const applyModelDiffs = (client: Client, entries: DiffReportEntry[], openApi: Record<string, unknown>, openApiVersion: OpenApiVersion, prefix: PrefixArtifacts, context?: Context): void => {
    const schemaNameMap = buildSchemaNameMap(openApi, openApiVersion, prefix, context);
    const modelsByName = buildModelsByName(client.models);
    const ghostPropertyKeys = new Set<string>();

    entries.forEach(entry => {
        const segments = parseJsonPath(entry.path);
        const schemaName = getSchemaNameFromSegments(segments, openApiVersion);
        if (!schemaName) return;

        const models = getModelsForSchema(schemaName, schemaNameMap, modelsByName);
        if (models.length === 0) return;

        const propertiesIndex = segments.indexOf('properties');
        if (propertiesIndex === -1 || propertiesIndex + 1 >= segments.length) {
            return;
        }

        const rawPropertyName = segments[propertiesIndex + 1];
        const propertyName = escapeName(rawPropertyName);

        for (const model of models) {
            if (entry.action === 'removed' && propertiesIndex + 1 === segments.length - 1) {
                const key = `${model.name}:${model.alias}:${propertyName}`;
                if (ghostPropertyKeys.has(key)) continue;

                const exists = model.properties.some(prop => prop.name === propertyName);
                if (!exists) {
                    const ghost: Model = {
                        name: propertyName,
                        alias: '',
                        path: model.path,
                        export: 'generic',
                        type: 'unknown',
                        base: 'unknown',
                        template: null,
                        link: null,
                        description: null,
                        isDefinition: false,
                        isReadOnly: false,
                        isRequired: false,
                        isNullable: false,
                        imports: [],
                        enum: [],
                        enums: [],
                        properties: [],
                        diff: {
                            action: 'removed',
                            path: entry.path,
                            severity: entry.severity,
                            from: entry.from,
                            to: entry.to,
                        },
                        isGhost: true,
                    };
                    if (!model.ghostProperties) {
                        model.ghostProperties = [];
                    }
                    model.ghostProperties.push(ghost);
                    ghostPropertyKeys.add(key);
                }
                continue;
            }

            if (entry.action === 'changed' && segments[segments.length - 1] === 'type') {
                const property = model.properties.find(prop => prop.name === propertyName);
                if (!property) continue;

                const previousType = describeSchemaType(entry.from);
                const currentTypeRaw = typeof entry.to === 'string' ? entry.to : describeSchemaType(entry.to);
                const currentType = normalizeScalarType(currentTypeRaw);
                const previousScalar = normalizeScalarType(previousType);

                property.diff = {
                    action: entry.action,
                    path: entry.path,
                    severity: entry.severity,
                    from: entry.from,
                    to: entry.to,
                    previousType,
                };

                if (previousScalar && currentType && previousScalar !== currentType) {
                    property.needsCoercion = true;
                    property.coercionFrom = previousScalar;
                    property.coercionTo = currentType;
                    model.hasCoercion = true;
                }
            }
        }
    });
};

const applyMiracleTypeCoercions = (client: Client, confirmedMiracles: MiracleEntry[], entries: DiffReportEntry[]): void => {
    if (!confirmedMiracles.length) return;

    const modelsByName = buildModelsByName(client.models);

    for (const miracle of confirmedMiracles) {
        if (miracle.type !== 'TYPE_COERCION') continue;
        if (!miracle.modelName) continue;

        const models = modelsByName.get(miracle.modelName) ?? [];
        if (models.length === 0) continue;

        const rawProperty = miracle.newProperty ?? miracle.oldProperty;
        if (!rawProperty) continue;

        const propertyName = escapeName(rawProperty);

        for (const model of models) {
            const property = model.properties.find(prop => prop.name === propertyName);
            if (!property) continue;

            property.needsCoercion = true;
            model.hasCoercion = true;

            if (!miracle.newPath) continue;
            const typePath = `${miracle.newPath}.type`;
            const typeEntry = entries.find(entry => entry.action === 'changed' && entry.path === typePath);
            if (!typeEntry) continue;

            const previousType = describeSchemaType(typeEntry.from);
            const currentTypeRaw = typeof typeEntry.to === 'string' ? typeEntry.to : describeSchemaType(typeEntry.to);
            const currentType = normalizeScalarType(currentTypeRaw);
            const previousScalar = normalizeScalarType(previousType);

            if (previousScalar && currentType && previousScalar !== currentType) {
                property.coercionFrom = previousScalar;
                property.coercionTo = currentType;
                if (!property.diff) {
                    property.diff = {
                        action: typeEntry.action,
                        path: typeEntry.path,
                        severity: typeEntry.severity,
                        from: typeEntry.from,
                        to: typeEntry.to,
                        previousType,
                    };
                }
            }
        }
    }
};

/**
 * Применяет структурный diff-отчёт к сгенерированному клиенту: помечает изменения, miracles и ghost-свойства.
 * @param client сгенерированный клиент
 * @param openApi исходная OpenAPI-спецификация
 * @param openApiVersion версия OpenAPI
 * @param diffReport загруженный diff-отчёт или null
 * @param prefix артефакты префиксов имён
 * @param [context] контекст генерации для разрешения имён схем
 * @returns клиент с аннотациями diff
 */
export const applyDiffReportToClient = ({ client, openApi, openApiVersion, diffReport, prefix, context, miraclesConfig }: ApplyDiffParams): Client => {
    const entries = diffReport?.diff?.all ?? [];
    const schemaNameMap = buildSchemaNameMap(openApi, openApiVersion, prefix, context);
    const confirmedMiracles = (diffReport?.miracles ?? [])
        .filter(miracle => miracle.status === 'confirmed' || miracle.confidence === 1)
        .filter(miracle => passesMiraclesConfigFilter(miracle, miraclesConfig))
        .map(miracle => {
            const oldSegments = parseJsonPath(miracle.oldPath);
            const newSegments = parseJsonPath(miracle.newPath);
            const oldSchema = getSchemaNameFromSegments(oldSegments, openApiVersion);
            const newSchema = getSchemaNameFromSegments(newSegments, openApiVersion);
            const schemaName = oldSchema || newSchema;
            const modelName = (schemaName ? schemaNameMap.get(schemaName) : undefined) ?? miracle.modelName;

            const oldPropIndex = oldSegments.indexOf('properties');
            const newPropIndex = newSegments.indexOf('properties');
            const oldProperty = oldPropIndex !== -1 ? oldSegments[oldPropIndex + 1] : undefined;
            const newProperty = newPropIndex !== -1 ? newSegments[newPropIndex + 1] : undefined;

            return {
                ...miracle,
                modelName,
                oldProperty,
                newProperty,
            };
        });

    if (confirmedMiracles.length > 0) {
        client.miracles = confirmedMiracles;
    }

    applyMiracleTypeCoercions(client, confirmedMiracles, entries);

    if (entries.length === 0) {
        return client;
    }

    applyModelDiffs(client, entries, openApi, openApiVersion, prefix, context);
    applyOperationDiffs(client, entries);

    return client;
};
