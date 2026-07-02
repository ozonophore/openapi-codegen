import { createFinding, type DetectorContext, getSchemaDefinitions, getSchemaTypeSignature } from '../detectorUtils';
import { SpecFindingCategoryEnum } from '../types';

function isEmptyOrUntypedSchema(schema: unknown): boolean {
    if (!schema || typeof schema !== 'object') {
        return true;
    }

    const record = schema as Record<string, unknown>;
    if (record.$ref || record.type || record.allOf || record.oneOf || record.anyOf) {
        return false;
    }

    if (record.properties && Object.keys(record.properties as object).length > 0) {
        return false;
    }

    return true;
}

function findEmptyOrUntypedSchemas(schemas: Record<string, unknown>): string[] {
    const affected: string[] = [];

    for (const [schemaName, schema] of Object.entries(schemas)) {
        if (isEmptyOrUntypedSchema(schema)) {
            affected.push(schemaName);
        }
    }

    return affected;
}

function findPropertyTypeInconsistencies(schemas: Record<string, unknown>): string[] {
    const propertyTypes = new Map<string, Map<string, string>>();

    for (const [schemaName, schema] of Object.entries(schemas)) {
        const properties = (schema as Record<string, unknown>)?.properties as Record<string, unknown> | undefined;
        if (!properties) {
            continue;
        }

        for (const [propertyName, propertySchema] of Object.entries(properties)) {
            const signature = getSchemaTypeSignature(propertySchema);
            if (!propertyTypes.has(propertyName)) {
                propertyTypes.set(propertyName, new Map());
            }
            propertyTypes.get(propertyName)!.set(schemaName, signature);
        }
    }

    const inconsistencies: string[] = [];
    for (const [propertyName, typeBySchema] of propertyTypes.entries()) {
        const signatures = new Set(typeBySchema.values());
        if (signatures.size > 1) {
            const details = Array.from(typeBySchema.entries())
                .map(([schemaName, signature]) => `${schemaName}(${signature})`)
                .join(', ');
            inconsistencies.push(`property "${propertyName}" in schemas: ${details}`);
        }
    }

    return inconsistencies;
}

export function detectEmptyOrUntypedSchema(ctx: DetectorContext) {
    const schemas = getSchemaDefinitions(ctx.spec);
    if (!schemas) {
        return [];
    }

    const findings = [];
    const emptySchemas = findEmptyOrUntypedSchemas(schemas);
    if (emptySchemas.length > 0) {
        findings.push(
            createFinding(SpecFindingCategoryEnum.EmptyOrUntypedSchema, 'medium', `Found ${emptySchemas.length} empty or untyped schema(s); generated output may use any or skip validation`, {
                affectedPaths: emptySchemas,
                suggestedAction: 'Add type or $ref to schemas (align with emptySchemaStrategy)',
                specInput: ctx.specInput,
            })
        );
    }

    const propertyInconsistencies = findPropertyTypeInconsistencies(schemas);
    if (propertyInconsistencies.length > 0) {
        findings.push(
            createFinding(SpecFindingCategoryEnum.EmptyOrUntypedSchema, 'low', `Found ${propertyInconsistencies.length} cross-schema property type inconsistency(ies)`, {
                id: 'empty-or-untyped-schema-property-inconsistency',
                affectedPaths: propertyInconsistencies,
                suggestedAction: 'Align property types across schemas with the same property names',
                specInput: ctx.specInput,
            })
        );
    }

    return findings;
}
