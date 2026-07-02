import { createFinding, type DetectorContext, getSchemaDefinitions, resolveRefName } from '../detectorUtils';
import { SpecFindingCategoryEnum } from '../types';

function getSchemaNestingDepth(schema: unknown, schemas: Record<string, unknown>, visited: Set<string>): number {
    if (!schema || typeof schema !== 'object') {
        return 0;
    }

    const record = schema as Record<string, unknown>;
    if (typeof record.$ref === 'string') {
        const refName = resolveRefName(record.$ref);
        if (!refName || visited.has(refName)) {
            return 0;
        }

        visited.add(refName);
        const resolved = schemas[refName];
        const depth = getSchemaNestingDepth(resolved, schemas, visited);
        visited.delete(refName);
        return depth;
    }

    if (record.properties && typeof record.properties === 'object') {
        let maxChildDepth = 0;
        for (const propertySchema of Object.values(record.properties)) {
            maxChildDepth = Math.max(maxChildDepth, getSchemaNestingDepth(propertySchema, schemas, visited));
        }
        return 1 + maxChildDepth;
    }

    if (record.items) {
        return 1 + getSchemaNestingDepth(record.items, schemas, visited);
    }

    const composed = [...((record.allOf as unknown[]) ?? []), ...((record.oneOf as unknown[]) ?? []), ...((record.anyOf as unknown[]) ?? [])];
    if (composed.length > 0) {
        let maxChildDepth = 0;
        for (const childSchema of composed) {
            maxChildDepth = Math.max(maxChildDepth, getSchemaNestingDepth(childSchema, schemas, visited));
        }
        return maxChildDepth;
    }

    return 0;
}

export function detectDeeplyNestedSchema(ctx: DetectorContext) {
    const maxDepth = ctx.config.maxNestingDepth ?? 5;
    const schemas = getSchemaDefinitions(ctx.spec);
    if (!schemas) {
        return [];
    }

    const deepSchemas: string[] = [];
    for (const [schemaName, schema] of Object.entries(schemas)) {
        const depth = getSchemaNestingDepth(schema, schemas, new Set());
        if (depth > maxDepth) {
            deepSchemas.push(`${schemaName} (depth ${depth})`);
        }
    }

    if (deepSchemas.length === 0) {
        return [];
    }

    return [
        createFinding(SpecFindingCategoryEnum.DeeplyNestedSchema, 'medium', `Found ${deepSchemas.length} schema(s) nested deeper than ${maxDepth} levels; generated interfaces may be hard to read`, {
            affectedPaths: deepSchemas,
            suggestedAction: 'Extract nested sub-schemas into components.schemas',
            specInput: ctx.specInput,
        }),
    ];
}
