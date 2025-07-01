import type { Enum } from '../types/shared/Enum.model';
import type { WithEnumExtension } from '../types/shared/extensions/WithEnumExtension.model';

/**
 * Extend the enum with the x-enum properties. This adds the capability
 * to use names and descriptions inside the generated enums.
 * @param enumerators
 * @param definition
 */
export function extendEnum(enumerators: Enum[], definition: WithEnumExtension): Enum[] {
    const names = definition['x-enum-varnames'];
    const descriptions = definition['x-enum-descriptions'];

    return enumerators.map((enumerator, index) => ({
        name: names?.[index] || enumerator.name,
        description: descriptions?.[index] || enumerator.description,
        value: enumerator.value,
        type: enumerator.type,
    }));
}
