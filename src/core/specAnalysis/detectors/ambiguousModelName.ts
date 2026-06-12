import { COMMON_DEFAULT_OPTIONS_VALUES } from '../../../common/Consts';
import type { PrefixArtifacts } from '../../types/base/PrefixArtifacts.model';
import { encode } from '../../utils/encode';
import { getModelNameWithPrefix } from '../../utils/getModelNameWithPrefix';
import { createFinding, type DetectorContext, getSchemaDefinitions } from '../detectorUtils';
import { SpecFindingCategoryEnum } from '../types';

function resolvePrefixes(ctx: DetectorContext): PrefixArtifacts {
    return (
        ctx.prefixes ?? {
            interface: COMMON_DEFAULT_OPTIONS_VALUES.interfacePrefix,
            enum: COMMON_DEFAULT_OPTIONS_VALUES.enumPrefix,
            type: COMMON_DEFAULT_OPTIONS_VALUES.typePrefix,
        }
    );
}

export function detectAmbiguousModelName(ctx: DetectorContext) {
    const schemas = getSchemaDefinitions(ctx.spec);
    if (!schemas) {
        return [];
    }

    const prefixes = resolvePrefixes(ctx);
    const schemaNames = Object.keys(schemas);
    const generatedByName = new Map<string, string>();

    for (const name of schemaNames) {
        const definition = schemas[name] as Record<string, unknown>;
        const encodedName = encode(name);
        generatedByName.set(name, getModelNameWithPrefix(encodedName, definition, prefixes));
    }

    const conflictNames = new Set<string>();

    for (let i = 0; i < schemaNames.length; i++) {
        for (let j = i + 1; j < schemaNames.length; j++) {
            const nameA = schemaNames[i]!;
            const nameB = schemaNames[j]!;
            const genA = generatedByName.get(nameA)!;
            const genB = generatedByName.get(nameB)!;

            if (nameA !== nameB && genA === genB) {
                conflictNames.add(nameA);
                conflictNames.add(nameB);
            }
            if (genA === nameB || genB === nameA) {
                conflictNames.add(nameA);
                conflictNames.add(nameB);
            }
        }
    }

    if (conflictNames.size === 0) {
        return [];
    }

    const affected = Array.from(conflictNames).sort();
    return [
        createFinding(SpecFindingCategoryEnum.AmbiguousModelName, 'medium', `Schema names may collide with generated prefixes: ${affected.join(', ')}`, {
            id: 'ambiguous-model-name-prefix',
            affectedPaths: affected,
            suggestedAction: 'Rename schemas to avoid interface/enum/type prefix collisions in output',
            specInput: ctx.specInput,
        }),
    ];
}
