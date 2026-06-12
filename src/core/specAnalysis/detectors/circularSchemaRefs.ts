import { collectSchemaRefs, createFinding, type DetectorContext, getSchemaDefinitions, resolveRefName } from '../detectorUtils';
import { SpecFindingCategoryEnum } from '../types';

function findCircularReferences(ctx: DetectorContext): string[] {
    const schemas = getSchemaDefinitions(ctx.spec);
    if (!schemas) {
        return [];
    }

    const cycles: string[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const traverse = (schemaName: string, pathStack: string[]): void => {
        if (visiting.has(schemaName)) {
            cycles.push([...pathStack, schemaName].join(' -> '));
            return;
        }
        if (visited.has(schemaName)) {
            return;
        }

        const schema = schemas[schemaName];
        if (!schema) {
            return;
        }

        visiting.add(schemaName);
        const refs = new Set<string>();
        collectSchemaRefs(schema, refs);

        for (const ref of refs) {
            const refName = resolveRefName(ref);
            if (refName && schemas[refName]) {
                traverse(refName, [...pathStack, schemaName]);
            }
        }

        visiting.delete(schemaName);
        visited.add(schemaName);
    };

    for (const schemaName of Object.keys(schemas)) {
        if (!visited.has(schemaName)) {
            traverse(schemaName, []);
        }
    }

    return cycles;
}

export function detectCircularSchemaRefs(ctx: DetectorContext) {
    const cycles = findCircularReferences(ctx);
    if (cycles.length === 0) {
        return [];
    }

    return [
        createFinding(SpecFindingCategoryEnum.CircularSchemaRefs, 'high', `Found ${cycles.length} circular reference(s) in component schemas; generated types may use any or break imports`, {
            affectedPaths: cycles,
            suggestedAction: 'Break $ref cycles in components.schemas (use discriminators or intermediate types)',
            specInput: ctx.specInput,
        }),
    ];
}
