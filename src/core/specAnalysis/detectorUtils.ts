import type { SpecAnalysisConfig } from '../analysis/types';
import type { PrefixArtifacts } from '../types/base/PrefixArtifacts.model';
import type { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import type { OpenApiOperationWalkContext } from '../utils/openApiOperationWalker';
import type { SpecFinding, SpecFindingCategory, SpecFindingSeverity } from './types';

export type DetectorContext = {
    spec: CommonOpenApi;
    config: SpecAnalysisConfig;
    specInput?: string;
    prefixes?: PrefixArtifacts;
    walker: {
        forEachOperation: (callback: (context: OpenApiOperationWalkContext) => void) => void;
    };
};

export type SpecDetector = (ctx: DetectorContext) => SpecFinding[];

export function createFinding(
    category: SpecFindingCategory,
    severity: SpecFindingSeverity,
    description: string,
    options: {
        id?: string;
        affectedPaths?: string[];
        suggestedAction?: string;
        specInput?: string;
    } = {}
): SpecFinding {
    return {
        id: options.id ?? category,
        category,
        severity,
        description,
        ...(options.affectedPaths ? { affectedPaths: options.affectedPaths } : {}),
        ...(options.suggestedAction ? { suggestedAction: options.suggestedAction } : {}),
        ...(options.specInput ? { specInput: options.specInput } : {}),
    };
}

function getComponents(spec: CommonOpenApi): Record<string, unknown> | undefined {
    const record = spec as unknown as Record<string, unknown>;
    return (record.components as Record<string, unknown> | undefined) ?? (record.definitions as Record<string, unknown> | undefined);
}

export function getSchemaDefinitions(spec: CommonOpenApi): Record<string, unknown> | null {
    const components = getComponents(spec);
    if (!components) {
        return null;
    }

    return (components.schemas as Record<string, unknown> | undefined) ?? components;
}

export function resolveRefName(ref: string): string | null {
    const match = ref.match(/^#\/components\/schemas\/(.+)$/) || ref.match(/^#\/definitions\/(.+)$/);
    return match ? match[1] : null;
}

export function collectSchemaRefs(obj: unknown, refs: Set<string>): void {
    if (!obj || typeof obj !== 'object') {
        return;
    }

    if (Array.isArray(obj)) {
        for (const item of obj) {
            collectSchemaRefs(item, refs);
        }
        return;
    }

    const record = obj as Record<string, unknown>;
    if (typeof record.$ref === 'string' && record.$ref.startsWith('#/')) {
        refs.add(record.$ref);
    }

    for (const value of Object.values(record)) {
        collectSchemaRefs(value, refs);
    }
}

export function getSchemaTypeSignature(schema: unknown): string {
    if (!schema || typeof schema !== 'object') {
        return 'unknown';
    }

    const record = schema as Record<string, unknown>;
    if (typeof record.$ref === 'string') {
        return record.$ref;
    }

    if (record.type === 'array') {
        return `array<${getSchemaTypeSignature(record.items)}>`;
    }

    if (typeof record.type === 'string') {
        return typeof record.format === 'string' ? `${record.type}:${record.format}` : record.type;
    }

    if (record.allOf) {
        return 'allOf';
    }

    if (record.oneOf) {
        return 'oneOf';
    }

    if (record.anyOf) {
        return 'anyOf';
    }

    if (record.properties) {
        return 'object';
    }

    return 'unknown';
}

export function extractResourceName(path: string): string {
    return path.split('/').filter(part => part && !part.startsWith('{'))[0] || 'unknown';
}
