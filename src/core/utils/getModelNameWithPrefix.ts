import { PrefixArtifacts } from 'core/types/base/PrefixArtifacts.model';

export function getModelNameWithPrefix(originalName: string, definition: any, prefixes: PrefixArtifacts) {
    if (definition.enum && definition !== 'boolean') {
        return `${prefixes.enum}${originalName}`;
    } else if (definition.oneOf || definition.anyOf || definition.allOf || ['string', 'number', 'integer', 'boolean', 'array'].includes(definition.type)) {
        return `${prefixes.type}${originalName}`;
    } else if (definition.type === 'object') {
        return `${prefixes.interface}${originalName}`;
    }

    return originalName;
}
