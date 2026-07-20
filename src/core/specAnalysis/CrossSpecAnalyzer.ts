import type { SpecAnalysisConfig } from '../analysis/types';
import { buildArtifactKey } from '../reuseStore/ArtifactFingerprinter';
import type { ReuseStoreManifest } from '../reuseStore/types';
import { filterSpecFindings } from './CodegenSpecAnalyzer';
import { createFinding } from './detectorUtils';
import type { CrossSpecItemConfig, SpecFinding } from './types';
import { SpecFindingCategoryEnum } from './types';

export type CrossSpecContext = {
    manifest: ReuseStoreManifest;
    items: CrossSpecItemConfig[];
};

class CrossSpecAnalyzer {
    analyze(ctx: CrossSpecContext, config?: SpecAnalysisConfig): SpecFinding[] {
        const conflictFindings = detectNameHashConflicts(ctx);
        const findings = [...conflictFindings, ...detectReuseOpportunities(ctx), ...detectSharedOutputCollisionRisk(ctx)];
        return config ? filterSpecFindings(findings, config) : findings;
    }
}

function groupArtifactsByName(manifest: ReuseStoreManifest): Map<string, Array<{ schemaHash: string; specItems: Set<string> }>> {
    const byName = new Map<string, Map<string, Set<string>>>();

    for (const artifact of Object.values(manifest.artifacts)) {
        if (!byName.has(artifact.name)) {
            byName.set(artifact.name, new Map());
        }
        const hashMap = byName.get(artifact.name)!;
        if (!hashMap.has(artifact.schemaHash)) {
            hashMap.set(artifact.schemaHash, new Set());
        }
        const specs = hashMap.get(artifact.schemaHash)!;
        for (const ref of artifact.referencedBy) {
            specs.add(ref.specItem);
        }
        if (specs.size === 0) {
            specs.add(artifact.firstSeenSpec);
        }
    }

    const result = new Map<string, Array<{ schemaHash: string; specItems: Set<string> }>>();
    for (const [name, hashMap] of byName.entries()) {
        result.set(
            name,
            Array.from(hashMap.entries()).map(([schemaHash, specItems]) => ({ schemaHash, specItems }))
        );
    }

    return result;
}

function detectNameHashConflicts(ctx: CrossSpecContext): SpecFinding[] {
    const findings: SpecFinding[] = [];

    for (const [name, hashGroups] of groupArtifactsByName(ctx.manifest).entries()) {
        if (hashGroups.length <= 1) {
            continue;
        }

        const specGroups = hashGroups.map(group => `${Array.from(group.specItems).sort().join(', ')} (${group.schemaHash.slice(0, 8)})`);
        findings.push(
            createFinding(SpecFindingCategoryEnum.CrossSpecNameHashConflict, 'high', `Model "${name}" has different schemas across specs: ${specGroups.join(' vs ')}`, {
                affectedPaths: [name],
                suggestedAction: 'Rename or align schemas so ReuseStore can deduplicate by name+hash',
            })
        );
    }

    return findings;
}

function detectReuseOpportunities(ctx: CrossSpecContext): SpecFinding[] {
    const findings: SpecFinding[] = [];

    for (const artifact of Object.values(ctx.manifest.artifacts)) {
        const specItems = Array.from(new Set(artifact.referencedBy.map(ref => ref.specItem)));
        if (specItems.length < 2) {
            continue;
        }

        findings.push(
            createFinding(SpecFindingCategoryEnum.CrossSpecReuseOpportunity, 'info', `Model "${artifact.name}" shared across ${specItems.length} specs: ${specItems.sort().join(', ')}`, {
                affectedPaths: [artifact.name],
                suggestedAction: `${specItems.length - 1} render cycle(s) can be saved via ReuseStore`,
            })
        );
    }

    return findings;
}

function detectSharedOutputCollisionRisk(ctx: CrossSpecContext): SpecFinding[] {
    const outputGroups = new Map<string, Set<string>>();

    for (const item of ctx.items) {
        for (const outputPath of [item.outputModels, item.outputSchemas]) {
            if (!outputPath) {
                continue;
            }
            if (!outputGroups.has(outputPath)) {
                outputGroups.set(outputPath, new Set());
            }
            outputGroups.get(outputPath)!.add(item.name);
        }
    }

    const findings: SpecFinding[] = [];
    for (const [outputPath, specs] of outputGroups.entries()) {
        if (specs.size <= 1) {
            continue;
        }

        findings.push(
            createFinding(
                SpecFindingCategoryEnum.SharedOutputCollisionRisk,
                'high',
                `Output path "${outputPath}" is shared by ${specs.size} specs without ReuseStore coordination: ${Array.from(specs).join(', ')}`,
                {
                    affectedPaths: [outputPath],
                    suggestedAction: 'Use distinct output paths or enable ReuseStore deduplication',
                }
            )
        );
    }

    return findings;
}

export function runCrossSpecAnalysis(manifest: ReuseStoreManifest, items: CrossSpecItemConfig[], config?: SpecAnalysisConfig): SpecFinding[] {
    const analyzer = new CrossSpecAnalyzer();
    return analyzer.analyze({ manifest, items }, config);
}

export function buildManifestFromParsedSpecs(
    entries: Array<{ specItem: string; schemas: Record<string, Record<string, unknown>> }>,
    hashSchema: (schema: Record<string, unknown>) => string
): ReuseStoreManifest {
    const now = new Date().toISOString();
    const artifacts: ReuseStoreManifest['artifacts'] = {};
    const optionsSliceHash = 'spec-analysis';

    for (const { specItem, schemas } of entries) {
        for (const [name, schema] of Object.entries(schemas)) {
            const schemaHash = hashSchema(schema);
            const artifactKey = buildArtifactKey(name, 'model', schemaHash, optionsSliceHash);
            const existing = artifacts[artifactKey];

            if (existing) {
                if (!existing.referencedBy.some(ref => ref.specItem === specItem)) {
                    existing.referencedBy.push({ specItem, outputPath: specItem });
                }
                continue;
            }

            artifacts[artifactKey] = {
                artifactKey,
                name,
                kind: 'model',
                schemaHash,
                optionsSliceHash,
                relativePath: `${specItem}/${name}.ts`,
                contentHash: schemaHash,
                byteSize: 0,
                firstSeenSpec: specItem,
                referencedBy: [{ specItem, outputPath: specItem }],
                createdAt: now,
                updatedAt: now,
            };
        }
    }

    return {
        version: 1,
        generatorVersion: 'spec-analysis',
        updatedAt: now,
        artifacts,
        specItems: {},
    };
}
