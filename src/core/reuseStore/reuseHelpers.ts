import path from 'path';

import type { Model } from '../types/shared/Model.model';

function normalizeModelPath(modelPath: string): string {
    return path.posix.normalize(modelPath.replace(/^\.\//, ''));
}

function appendOptionsSliceHash(basePath: string, optionsSliceHash: string): string {
    const hashSuffix = optionsSliceHash.slice(0, 8);
    if (basePath.endsWith('.ts')) {
        return `${basePath.slice(0, -3)}__${hashSuffix}.ts`;
    }
    return `${basePath}__${hashSuffix}`;
}

export function buildModelArtifactRelativePath(model: Model, optionsSliceHash: string): string {
    const folder = model.export === 'enum' ? 'enums' : 'models';
    const base = `artifacts/${folder}/${normalizeModelPath(model.path)}.ts`;
    return appendOptionsSliceHash(base, optionsSliceHash);
}

export function buildSchemaArtifactRelativePath(model: Model, optionsSliceHash: string): string {
    const base = `artifacts/schemas/${normalizeModelPath(model.path)}Schema.ts`;
    return appendOptionsSliceHash(base, optionsSliceHash);
}

export function buildNamespacedModelArtifactRelativePath(model: Model, specItem: string, optionsSliceHash: string): string {
    const folder = model.export === 'enum' ? 'enums' : 'models';
    const base = `artifacts/${folder}/${normalizeModelPath(model.path)}__${specItem}.ts`;
    return appendOptionsSliceHash(base, optionsSliceHash);
}

export function buildNamespacedSchemaArtifactRelativePath(model: Model, specItem: string, optionsSliceHash: string): string {
    const base = `artifacts/schemas/${normalizeModelPath(model.path)}Schema__${specItem}.ts`;
    return appendOptionsSliceHash(base, optionsSliceHash);
}

export function buildModelSchemaMap(context: { getAllCanonicalRefs(): string[]; get(ref: string): unknown }): Map<string, Record<string, unknown>> {
    const schemaByComponentName = new Map<string, Record<string, unknown>>();

    for (const ref of context.getAllCanonicalRefs()) {
        const definition = context.get(ref);
        if (!definition || typeof definition !== 'object') {
            continue;
        }

        const componentName = extractComponentName(ref);
        if (componentName) {
            schemaByComponentName.set(componentName, definition as Record<string, unknown>);
        }
    }

    return schemaByComponentName;
}

export function resolveModelSchema(model: Model, schemaByComponentName: Map<string, Record<string, unknown>>): Record<string, unknown> {
    const byPath = schemaByComponentName.get(model.path);
    if (byPath) {
        return byPath;
    }

    const strippedName = model.name.replace(/^[IET]/, '');
    const byName = schemaByComponentName.get(strippedName);
    if (byName) {
        return byName;
    }

    return {
        type: model.export === 'enum' ? 'string' : 'object',
        description: model.description ?? undefined,
        enum: model.enum.length > 0 ? model.enum.map(item => item.value) : undefined,
    };
}

function extractComponentName(ref: string): string | undefined {
    const fragment = ref.includes('#') ? ref.split('#')[1] : undefined;
    if (!fragment) {
        return undefined;
    }

    const segments = fragment.split('/').filter(Boolean);
    return segments[segments.length - 1];
}
