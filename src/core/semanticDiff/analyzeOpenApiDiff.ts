import path from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { GovernancePolicyConfig, GovernanceReport, evaluateGovernanceRules } from '../governance/evaluateGovernanceRules';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';

type ChangeSeverity = 'breaking' | 'non-breaking' | 'informational';

type SemanticDiffSummary = {
    breaking: number;
    nonBreaking: number;
    informational: number;
};

type SemanticDiffSemverRecommendation = 'major' | 'minor' | 'patch';
type SemanticDiffConfidence = 'high' | 'medium' | 'low';
type SemanticDiffRecommendationReason =
    | 'HAS_BREAKING_CHANGES'
    | 'HAS_BACKWARD_COMPATIBLE_CHANGES'
    | 'HAS_INFORMATIONAL_ONLY_CHANGES'
    | 'NO_API_SURFACE_CHANGES';

type SemanticDiffRecommendation = {
    semver: SemanticDiffSemverRecommendation;
    confidence: SemanticDiffConfidence;
    reason: string;
    reasons: SemanticDiffRecommendationReason[];
};

type SemanticDiffChange = {
    type: string;
    severity: ChangeSeverity;
    message: string;
    path: string;
};

export const SEMANTIC_DIFF_REPORT_SCHEMA_VERSION = '1.1.0';

export type SemanticDiffReport = {
    schemaVersion: string;
    summary: SemanticDiffSummary;
    recommendation: SemanticDiffRecommendation;
    governance: GovernanceReport;
    changes: SemanticDiffChange[];
};

type AnalyzeOpenApiDiffOptions = {
    allowBreaking?: boolean;
    governanceConfig?: GovernancePolicyConfig;
};

type SchemaLike = Record<string, unknown>;
type OperationLike = Record<string, unknown>;

type CanonicalModel = {
    properties: Map<string, string>;
    required: Set<string>;
    enumValues: Set<string>;
};

type CanonicalParameter = {
    required: boolean;
    type: string;
};

type CanonicalOperation = {
    parameters: Map<string, CanonicalParameter>;
    requestBodyRequired: boolean;
    successResponses: Map<string, string>;
};

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

/**
 * Extracts OpenAPI v2/v3 schema container from a loaded spec.
 */
function getSchemaContainer(spec: CommonOpenApi): Record<string, SchemaLike> {
    const specRecord = spec as unknown as Record<string, unknown>;
    const components = specRecord.components as Record<string, unknown> | undefined;
    const schemas = components?.schemas as Record<string, SchemaLike> | undefined;
    const definitions = specRecord.definitions as Record<string, SchemaLike> | undefined;

    if (schemas && typeof schemas === 'object') {
        return schemas;
    }
    if (definitions && typeof definitions === 'object') {
        return definitions;
    }
    return {};
}

/**
 * Normalizes schema into a comparable type descriptor.
 */
function getSchemaType(schema: unknown): string {
    if (!schema || typeof schema !== 'object') {
        return 'unknown';
    }

    const schemaRecord = schema as SchemaLike;
    const schemaRef = schemaRecord.$ref;
    if (typeof schemaRef === 'string') {
        return `ref:${schemaRef}`;
    }

    const enumValues = schemaRecord.enum;
    if (Array.isArray(enumValues)) {
        const values = enumValues.map(item => String(item)).sort();
        return `enum(${values.join('|')})`;
    }

    const schemaType = schemaRecord.type;
    if (schemaType === 'array') {
        return `array<${getSchemaType(schemaRecord.items)}>`;
    }

    if (Array.isArray(schemaRecord.oneOf)) {
        const unionTypes = schemaRecord.oneOf.map(item => getSchemaType(item)).sort();
        return `oneOf(${unionTypes.join('|')})`;
    }

    if (Array.isArray(schemaRecord.anyOf)) {
        const unionTypes = schemaRecord.anyOf.map(item => getSchemaType(item)).sort();
        return `anyOf(${unionTypes.join('|')})`;
    }

    if (Array.isArray(schemaRecord.allOf)) {
        const intersectionTypes = schemaRecord.allOf.map(item => getSchemaType(item)).sort();
        return `allOf(${intersectionTypes.join('&')})`;
    }

    if (typeof schemaType === 'string') {
        const schemaFormat = schemaRecord.format;
        if (typeof schemaFormat === 'string' && schemaFormat.trim()) {
            return `${schemaType}:${schemaFormat}`;
        }
        return schemaType;
    }

    const properties = schemaRecord.properties as Record<string, unknown> | undefined;
    if (properties && typeof properties === 'object') {
        return 'object';
    }

    return 'unknown';
}

/**
 * Classifies a type transition by severity for semantic diff.
 */
function classifyTypeTransition(fromType: string, toType: string): ChangeSeverity {
    if (fromType === toType) {
        return 'informational';
    }

    if (isTypeAssignable(fromType, toType)) {
        return 'non-breaking';
    }

    return 'breaking';
}

/**
 * Splits descriptor content by top-level delimiter while preserving nested blocks.
 */
function splitTopLevel(input: string, delimiter: string): string[] {
    const result: string[] = [];
    let buffer = '';
    let depth = 0;

    for (const char of input) {
        if (char === '(' || char === '<') {
            depth += 1;
            buffer += char;
            continue;
        }
        if (char === ')' || char === '>') {
            depth = Math.max(0, depth - 1);
            buffer += char;
            continue;
        }
        if (char === delimiter && depth === 0) {
            if (buffer.trim()) {
                result.push(buffer.trim());
            }
            buffer = '';
            continue;
        }
        buffer += char;
    }

    if (buffer.trim()) {
        result.push(buffer.trim());
    }

    return result;
}

/**
 * Extracts descriptor arguments for pattern prefix(...)
 */
function extractDescriptorArgs(descriptor: string, prefix: string): string[] | null {
    if (!descriptor.startsWith(`${prefix}(`) || !descriptor.endsWith(')')) {
        return null;
    }

    const inner = descriptor.slice(prefix.length + 1, -1);
    if (!inner.trim()) {
        return [];
    }

    const separator = prefix === 'allOf' ? '&' : '|';
    return splitTopLevel(inner, separator);
}

/**
 * Parses array descriptor array<...>.
 */
function extractArrayItemType(descriptor: string): string | null {
    if (!descriptor.startsWith('array<') || !descriptor.endsWith('>')) {
        return null;
    }

    return descriptor.slice('array<'.length, -1);
}

/**
 * Parses scalar descriptor into base and format parts.
 */
function parseScalarDescriptor(descriptor: string): { base: string; format: string | null } {
    const [base, ...formatParts] = descriptor.split(':');
    if (!base) {
        return { base: descriptor, format: null };
    }

    if (formatParts.length === 0) {
        return { base, format: null };
    }

    return {
        base,
        format: formatParts.join(':'),
    };
}

/**
 * Checks whether format transition is widening for a given base type.
 */
function isFormatAssignable(baseType: string, fromFormat: string | null, toFormat: string | null): boolean {
    if (fromFormat === toFormat) {
        return true;
    }

    if (fromFormat && !toFormat) {
        return true;
    }

    if (!fromFormat && toFormat) {
        return false;
    }

    if (!fromFormat || !toFormat) {
        return true;
    }

    if (baseType === 'integer') {
        if (fromFormat === 'int32' && toFormat === 'int64') {
            return true;
        }
        if (fromFormat === 'int64' && toFormat === 'int32') {
            return false;
        }
    }

    if (baseType === 'number') {
        if (fromFormat === 'float' && toFormat === 'double') {
            return true;
        }
        if (fromFormat === 'double' && toFormat === 'float') {
            return false;
        }
    }

    return false;
}

/**
 * Compares two scalar type descriptors without composite wrappers.
 */
function isScalarTypeAssignable(fromType: string, toType: string): boolean {
    if (fromType === toType) {
        return true;
    }

    if (toType === 'any' || toType === 'unknown') {
        return true;
    }

    if (fromType === 'any' || fromType === 'unknown') {
        return false;
    }

    const fromRef = fromType.startsWith('ref:');
    const toRef = toType.startsWith('ref:');
    if (fromRef || toRef) {
        if (!fromRef || !toRef) {
            return false;
        }
        return fromType === toType;
    }

    const { base: fromBase, format: fromFormat } = parseScalarDescriptor(fromType);
    const { base: toBase, format: toFormat } = parseScalarDescriptor(toType);
    if (fromBase === toBase) {
        return isFormatAssignable(fromBase, fromFormat, toFormat);
    }

    if (fromBase === 'integer' && toBase === 'number') {
        return true;
    }

    return false;
}

/**
 * Checks assignability: true means change from -> to is widening or neutral.
 */
function isTypeAssignable(fromType: string, toType: string): boolean {
    if (fromType === toType) {
        return true;
    }

    const fromArrayItem = extractArrayItemType(fromType);
    const toArrayItem = extractArrayItemType(toType);
    if (fromArrayItem !== null || toArrayItem !== null) {
        if (fromArrayItem === null || toArrayItem === null) {
            return false;
        }
        return isTypeAssignable(fromArrayItem, toArrayItem);
    }

    const fromEnum = extractDescriptorArgs(fromType, 'enum');
    const toEnum = extractDescriptorArgs(toType, 'enum');
    if (fromEnum !== null || toEnum !== null) {
        if (fromEnum === null || toEnum === null) {
            return false;
        }
        return fromEnum.every(value => toEnum.includes(value));
    }

    const fromOneOf = extractDescriptorArgs(fromType, 'oneOf') ?? extractDescriptorArgs(fromType, 'anyOf');
    if (fromOneOf !== null) {
        return fromOneOf.every(option => isTypeAssignable(option, toType));
    }

    const toOneOf = extractDescriptorArgs(toType, 'oneOf') ?? extractDescriptorArgs(toType, 'anyOf');
    if (toOneOf !== null) {
        return toOneOf.some(option => isTypeAssignable(fromType, option));
    }

    const fromAllOf = extractDescriptorArgs(fromType, 'allOf');
    if (fromAllOf !== null) {
        return fromAllOf.some(option => isTypeAssignable(option, toType));
    }

    const toAllOf = extractDescriptorArgs(toType, 'allOf');
    if (toAllOf !== null) {
        return toAllOf.every(option => isTypeAssignable(fromType, option));
    }

    return isScalarTypeAssignable(fromType, toType);
}

/**
 * Builds canonical model map from v2/v3 schema section.
 */
function buildCanonicalModels(spec: CommonOpenApi): Map<string, CanonicalModel> {
    const models = new Map<string, CanonicalModel>();
    const schemas = getSchemaContainer(spec);

    for (const [name, schema] of Object.entries(schemas)) {
        const propertiesMap = new Map<string, string>();
        const schemaProperties = schema.properties as Record<string, unknown> | undefined;
        if (schemaProperties && typeof schemaProperties === 'object') {
            for (const [propertyName, propertySchema] of Object.entries(schemaProperties)) {
                propertiesMap.set(propertyName, getSchemaType(propertySchema));
            }
        }

        const requiredRaw = schema.required;
        const required = Array.isArray(requiredRaw) ? new Set(requiredRaw.map(value => String(value))) : new Set<string>();

        const modelEnumRaw = schema.enum;
        const modelEnum = Array.isArray(modelEnumRaw) ? new Set(modelEnumRaw.map(value => String(value))) : new Set<string>();

        models.set(name, {
            properties: propertiesMap,
            required,
            enumValues: modelEnum,
        });
    }

    return models;
}

/**
 * Checks whether response key is an explicit successful HTTP status key.
 */
function isSuccessResponseKey(value: string): boolean {
    return /^\s*2\d\d\s*$/.test(value) || /^\s*2xx\s*$/i.test(value);
}

/**
 * Resolves response payload schema type for OpenAPI v2/v3 response object.
 */
function getResponsePayloadType(response: unknown): string {
    if (!response || typeof response !== 'object') {
        return 'unknown';
    }

    const responseRecord = response as Record<string, unknown>;
    const content = responseRecord.content as Record<string, unknown> | undefined;
    if (content && typeof content === 'object') {
        const jsonContent = content['application/json'];
        if (jsonContent && typeof jsonContent === 'object') {
            const jsonSchema = (jsonContent as Record<string, unknown>).schema;
            if (jsonSchema) {
                return getSchemaType(jsonSchema);
            }
        }

        for (const mediaTypeObject of Object.values(content)) {
            if (!mediaTypeObject || typeof mediaTypeObject !== 'object') {
                continue;
            }

            const mediaSchema = (mediaTypeObject as Record<string, unknown>).schema;
            if (mediaSchema) {
                return getSchemaType(mediaSchema);
            }
        }
    }

    return getSchemaType(responseRecord.schema);
}

/**
 * Builds canonical operation map from OpenAPI paths.
 */
function buildCanonicalOperations(spec: CommonOpenApi): Map<string, CanonicalOperation> {
    const operations = new Map<string, CanonicalOperation>();
    const specRecord = spec as unknown as Record<string, unknown>;
    const paths = (specRecord.paths as Record<string, unknown> | undefined) ?? {};

    for (const [routePath, pathItemRaw] of Object.entries(paths)) {
        const pathItem = (pathItemRaw as OperationLike) ?? {};

        const pathParametersRaw = pathItem.parameters;
        const pathParameters = Array.isArray(pathParametersRaw) ? pathParametersRaw : [];

        for (const method of HTTP_METHODS) {
            const operationRaw = pathItem[method];
            if (!operationRaw || typeof operationRaw !== 'object') {
                continue;
            }

            const operation = operationRaw as OperationLike;
            const operationKey = `${method.toUpperCase()} ${routePath}`;
            const operationParametersRaw = operation.parameters;
            const operationParameters = Array.isArray(operationParametersRaw) ? operationParametersRaw : [];

            const mergedParameters = [...pathParameters, ...operationParameters];
            const parameters = new Map<string, CanonicalParameter>();

            for (const parameterRaw of mergedParameters) {
                if (!parameterRaw || typeof parameterRaw !== 'object') {
                    continue;
                }

                const parameter = parameterRaw as SchemaLike;
                const parameterName = typeof parameter.name === 'string' ? parameter.name : '';
                const parameterIn = typeof parameter.in === 'string' ? parameter.in : 'unknown';
                if (!parameterName) {
                    continue;
                }

                const schema = (parameter.schema as SchemaLike | undefined) ?? parameter;
                const type = getSchemaType(schema);
                const required = parameter.required === true;

                parameters.set(`${parameterIn}:${parameterName}`, { required, type });
            }

            const requestBody = operation.requestBody as SchemaLike | undefined;
            const requestBodyRequired = requestBody?.required === true;

            const successResponses = new Map<string, string>();
            const responses = operation.responses as Record<string, unknown> | undefined;
            if (responses && typeof responses === 'object') {
                for (const [responseCode, responseValue] of Object.entries(responses)) {
                    if (isSuccessResponseKey(responseCode)) {
                        successResponses.set(responseCode, getResponsePayloadType(responseValue));
                    }
                }
            }

            operations.set(operationKey, {
                parameters,
                requestBodyRequired,
                successResponses,
            });
        }
    }

    return operations;
}

/**
 * Pushes change entry to report collection.
 */
function pushChange(
    changes: SemanticDiffChange[],
    severity: ChangeSeverity,
    type: string,
    path: string,
    message: string
): void {
    changes.push({ severity, type, path, message });
}

/**
 * Normalizes, deduplicates and sorts changes for stable CI output.
 */
function normalizeAndDedupeChanges(changes: SemanticDiffChange[]): SemanticDiffChange[] {
    const unique = new Map<string, SemanticDiffChange>();

    for (const change of changes) {
        const normalizedPath = change.path.replace(/\s+/g, ' ').trim();
        const normalizedMessage = change.message.replace(/\s+/g, ' ').trim();
        const normalizedChange: SemanticDiffChange = {
            ...change,
            path: normalizedPath,
            message: normalizedMessage,
        };

        const key = [normalizedChange.severity, normalizedChange.type, normalizedChange.path, normalizedChange.message].join('|');
        if (!unique.has(key)) {
            unique.set(key, normalizedChange);
        }
    }

    return [...unique.values()].sort((left, right) => {
        if (left.path !== right.path) {
            return left.path.localeCompare(right.path);
        }
        if (left.type !== right.type) {
            return left.type.localeCompare(right.type);
        }
        if (left.severity !== right.severity) {
            return left.severity.localeCompare(right.severity);
        }

        return left.message.localeCompare(right.message);
    });
}

/**
 * Diffs canonical models and appends semantic changes.
 */
function diffModels(oldModels: Map<string, CanonicalModel>, newModels: Map<string, CanonicalModel>, changes: SemanticDiffChange[]): void {
    for (const oldModelName of oldModels.keys()) {
        if (!newModels.has(oldModelName)) {
            pushChange(changes, 'breaking', 'model.removed', `#/components/schemas/${oldModelName}`, `Model "${oldModelName}" was removed.`);
        }
    }

    for (const newModelName of newModels.keys()) {
        if (!oldModels.has(newModelName)) {
            pushChange(changes, 'non-breaking', 'model.added', `#/components/schemas/${newModelName}`, `Model "${newModelName}" was added.`);
        }
    }

    for (const [modelName, oldModel] of oldModels.entries()) {
        const newModel = newModels.get(modelName);
        if (!newModel) {
            continue;
        }

        for (const oldPropertyName of oldModel.properties.keys()) {
            if (!newModel.properties.has(oldPropertyName)) {
                pushChange(
                    changes,
                    'breaking',
                    'model.property.removed',
                    `#/components/schemas/${modelName}/properties/${oldPropertyName}`,
                    `Property "${oldPropertyName}" was removed from model "${modelName}".`
                );
            }
        }

        for (const [newPropertyName] of newModel.properties.entries()) {
            if (!oldModel.properties.has(newPropertyName)) {
                const isRequired = newModel.required.has(newPropertyName);
                pushChange(
                    changes,
                    isRequired ? 'breaking' : 'non-breaking',
                    'model.property.added',
                    `#/components/schemas/${modelName}/properties/${newPropertyName}`,
                    `Property "${newPropertyName}" was added to model "${modelName}".`
                );
            }
        }

        for (const [propertyName, oldPropertyType] of oldModel.properties.entries()) {
            const newPropertyType = newModel.properties.get(propertyName);
            if (!newPropertyType) {
                continue;
            }

            if (oldPropertyType !== newPropertyType) {
                const severity = classifyTypeTransition(oldPropertyType, newPropertyType);
                pushChange(
                    changes,
                    severity,
                    'model.property.type.changed',
                    `#/components/schemas/${modelName}/properties/${propertyName}`,
                    `Property "${propertyName}" type changed in model "${modelName}" from "${oldPropertyType}" to "${newPropertyType}".`
                );
            }

            const wasRequired = oldModel.required.has(propertyName);
            const isRequired = newModel.required.has(propertyName);
            if (wasRequired !== isRequired) {
                pushChange(
                    changes,
                    isRequired ? 'breaking' : 'non-breaking',
                    'model.property.required.changed',
                    `#/components/schemas/${modelName}/required/${propertyName}`,
                    `Property "${propertyName}" required flag changed in model "${modelName}" from "${wasRequired}" to "${isRequired}".`
                );
            }
        }

        for (const oldEnumValue of oldModel.enumValues) {
            if (!newModel.enumValues.has(oldEnumValue)) {
                pushChange(
                    changes,
                    'breaking',
                    'model.enum.value.removed',
                    `#/components/schemas/${modelName}/enum`,
                    `Enum value "${oldEnumValue}" was removed from model "${modelName}".`
                );
            }
        }

        for (const newEnumValue of newModel.enumValues) {
            if (!oldModel.enumValues.has(newEnumValue)) {
                pushChange(
                    changes,
                    'non-breaking',
                    'model.enum.value.added',
                    `#/components/schemas/${modelName}/enum`,
                    `Enum value "${newEnumValue}" was added to model "${modelName}".`
                );
            }
        }
    }
}

/**
 * Diffs canonical operations and appends semantic changes.
 */
function diffOperations(
    oldOperations: Map<string, CanonicalOperation>,
    newOperations: Map<string, CanonicalOperation>,
    changes: SemanticDiffChange[]
): void {
    for (const oldOperationKey of oldOperations.keys()) {
        if (!newOperations.has(oldOperationKey)) {
            pushChange(changes, 'breaking', 'operation.removed', `#/paths/${oldOperationKey}`, `Operation "${oldOperationKey}" was removed.`);
        }
    }

    for (const newOperationKey of newOperations.keys()) {
        if (!oldOperations.has(newOperationKey)) {
            pushChange(changes, 'non-breaking', 'operation.added', `#/paths/${newOperationKey}`, `Operation "${newOperationKey}" was added.`);
        }
    }

    for (const [operationKey, oldOperation] of oldOperations.entries()) {
        const newOperation = newOperations.get(operationKey);
        if (!newOperation) {
            continue;
        }

        for (const oldParameterName of oldOperation.parameters.keys()) {
            if (!newOperation.parameters.has(oldParameterName)) {
                pushChange(
                    changes,
                    'breaking',
                    'operation.parameter.removed',
                    `#/paths/${operationKey}/parameters/${oldParameterName}`,
                    `Parameter "${oldParameterName}" was removed from operation "${operationKey}".`
                );
            }
        }

        for (const [newParameterName, newParameter] of newOperation.parameters.entries()) {
            if (!oldOperation.parameters.has(newParameterName)) {
                pushChange(
                    changes,
                    newParameter.required ? 'breaking' : 'non-breaking',
                    'operation.parameter.added',
                    `#/paths/${operationKey}/parameters/${newParameterName}`,
                    `Parameter "${newParameterName}" was added to operation "${operationKey}".`
                );
            }
        }

        for (const [parameterName, oldParameter] of oldOperation.parameters.entries()) {
            const newParameter = newOperation.parameters.get(parameterName);
            if (!newParameter) {
                continue;
            }

            if (oldParameter.required !== newParameter.required) {
                pushChange(
                    changes,
                    newParameter.required ? 'breaking' : 'non-breaking',
                    'operation.parameter.required.changed',
                    `#/paths/${operationKey}/parameters/${parameterName}/required`,
                    `Required flag for parameter "${parameterName}" changed in operation "${operationKey}".`
                );
            }

            if (oldParameter.type !== newParameter.type) {
                const severity = classifyTypeTransition(oldParameter.type, newParameter.type);
                pushChange(
                    changes,
                    severity,
                    'operation.parameter.type.changed',
                    `#/paths/${operationKey}/parameters/${parameterName}/schema`,
                    `Type for parameter "${parameterName}" changed in operation "${operationKey}" from "${oldParameter.type}" to "${newParameter.type}".`
                );
            }
        }

        if (oldOperation.requestBodyRequired !== newOperation.requestBodyRequired) {
            pushChange(
                changes,
                newOperation.requestBodyRequired ? 'breaking' : 'non-breaking',
                'operation.requestBody.required.changed',
                `#/paths/${operationKey}/requestBody/required`,
                `requestBody.required changed in operation "${operationKey}" from "${oldOperation.requestBodyRequired}" to "${newOperation.requestBodyRequired}".`
            );
        }

        for (const oldResponseCode of oldOperation.successResponses.keys()) {
            if (!newOperation.successResponses.has(oldResponseCode)) {
                pushChange(
                    changes,
                    'breaking',
                    'operation.response.success.removed',
                    `#/paths/${operationKey}/responses/${oldResponseCode}`,
                    `Successful response "${oldResponseCode}" was removed from operation "${operationKey}".`
                );
            }
        }

        for (const newResponseCode of newOperation.successResponses.keys()) {
            if (!oldOperation.successResponses.has(newResponseCode)) {
                pushChange(
                    changes,
                    'non-breaking',
                    'operation.response.success.added',
                    `#/paths/${operationKey}/responses/${newResponseCode}`,
                    `Successful response "${newResponseCode}" was added to operation "${operationKey}".`
                );
            }
        }

        for (const [responseCode, oldResponseType] of oldOperation.successResponses.entries()) {
            const newResponseType = newOperation.successResponses.get(responseCode);
            if (!newResponseType || oldResponseType === newResponseType) {
                continue;
            }

            const severity = classifyTypeTransition(oldResponseType, newResponseType);
            pushChange(
                changes,
                severity,
                'operation.response.success.type.changed',
                `#/paths/${operationKey}/responses/${responseCode}/content`,
                `Successful response "${responseCode}" payload type changed in operation "${operationKey}" from "${oldResponseType}" to "${newResponseType}".`
            );
        }
    }
}

/**
 * Calculates summary counters from semantic changes list.
 */
function buildSummary(changes: SemanticDiffChange[]): SemanticDiffSummary {
    return changes.reduce(
        (summary, change) => {
            if (change.severity === 'breaking') {
                summary.breaking += 1;
            } else if (change.severity === 'non-breaking') {
                summary.nonBreaking += 1;
            } else {
                summary.informational += 1;
            }

            return summary;
        },
        {
            breaking: 0,
            nonBreaking: 0,
            informational: 0,
        }
    );
}

/**
 * Builds semver recommendation from semantic diff summary.
 */
function buildSemverRecommendation(summary: SemanticDiffSummary): SemanticDiffRecommendation {
    if (summary.breaking > 0) {
        return {
            semver: 'major',
            confidence: summary.breaking >= 3 ? 'high' : 'medium',
            reason: 'Breaking changes detected.',
            reasons: ['HAS_BREAKING_CHANGES'],
        };
    }

    if (summary.nonBreaking > 0) {
        return {
            semver: 'minor',
            confidence: summary.nonBreaking >= 3 ? 'high' : 'medium',
            reason: 'Backward-compatible feature changes detected.',
            reasons: ['HAS_BACKWARD_COMPATIBLE_CHANGES'],
        };
    }

    if (summary.informational > 0) {
        return {
            semver: 'patch',
            confidence: 'medium',
            reason: 'Only informational changes detected.',
            reasons: ['HAS_INFORMATIONAL_ONLY_CHANGES'],
        };
    }

    return {
        semver: 'patch',
        confidence: 'high',
        reason: 'No breaking or feature-level changes detected.',
        reasons: ['NO_API_SURFACE_CHANGES'],
    };
}

/**
 * Creates semantic diff report between two OpenAPI specs.
 */
export function analyzeOpenApiDiff(oldSpec: CommonOpenApi, newSpec: CommonOpenApi, options: AnalyzeOpenApiDiffOptions = {}): SemanticDiffReport {
    const oldModels = buildCanonicalModels(oldSpec);
    const newModels = buildCanonicalModels(newSpec);
    const oldOperations = buildCanonicalOperations(oldSpec);
    const newOperations = buildCanonicalOperations(newSpec);

    const changes: SemanticDiffChange[] = [];
    diffModels(oldModels, newModels, changes);
    diffOperations(oldOperations, newOperations, changes);

    const normalizedChanges = normalizeAndDedupeChanges(changes);

    const summary = buildSummary(normalizedChanges);
    const governance = evaluateGovernanceRules({
        openApi: newSpec,
        breakingChangesCount: summary.breaking,
        allowBreaking: options.allowBreaking ?? false,
        governanceConfig: options.governanceConfig,
    });

    return {
        schemaVersion: SEMANTIC_DIFF_REPORT_SCHEMA_VERSION,
        summary,
        recommendation: buildSemverRecommendation(summary),
        governance,
        changes: normalizedChanges,
    };
}

/**
 * Writes semantic diff report to JSON file and returns absolute path.
 */
export async function writeSemanticDiffReport(report: SemanticDiffReport, reportFilePath: string): Promise<string> {
    const resolvedPath = resolveHelper(process.cwd(), reportFilePath);
    const directory = path.dirname(resolvedPath);

    const directoryExists = await fileSystemHelpers.exists(directory);
    if (!directoryExists) {
        await fileSystemHelpers.mkdir(directory);
    }

    const reportContent = await format(JSON.stringify(report), 'json');
    await fileSystemHelpers.writeFile(resolvedPath, reportContent);

    return resolvedPath;
}
