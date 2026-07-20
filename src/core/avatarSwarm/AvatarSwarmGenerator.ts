import type { TStrictFlatOptions } from '../../common/TRawOptions';
import type { SpecGenerationStats } from '../reuseStore/GenerationReport';
import type { ReuseStore } from '../reuseStore/ReuseStore';
import type { AvatarDescriptor, SwarmManifest, SwarmSharedModel } from './types';

export class AvatarSwarmGenerator {
    build(items: TStrictFlatOptions[], specStats: SpecGenerationStats[], reuseStore?: ReuseStore | null): SwarmManifest {
        const statsBySpecItem = new Map<string, SpecGenerationStats>(specStats.map(s => [s.specItem, s]));

        const avatars: AvatarDescriptor[] = items.map(item => {
            const specItem = this.getSpecItemName(item.input);
            const stats = statsBySpecItem.get(specItem);
            return {
                specItem,
                input: item.input,
                output: item.output,
                reuseHits: stats?.reuseHits ?? 0,
                reuseMisses: stats?.reuseMisses ?? 0,
                operationIds: [],
            };
        });

        const sharedModels = this.buildSharedModels(reuseStore);
        const operationIndex = this.buildOperationIndex(items);

        return {
            version: 1,
            generatedAt: new Date().toISOString(),
            avatars,
            sharedModels,
            operationIndex,
        };
    }

    private buildSharedModels(reuseStore?: ReuseStore | null): SwarmSharedModel[] {
        if (!reuseStore) {
            return [];
        }

        const manifest = reuseStore.getManifest();
        const shared: SwarmSharedModel[] = [];

        for (const artifact of Object.values(manifest.artifacts)) {
            const usedBy = Array.from(new Set(artifact.referencedBy.map(ref => ref.specItem)));
            if (usedBy.length > 1) {
                shared.push({
                    name: artifact.name,
                    kind: artifact.kind,
                    usedBy,
                    artifactKey: artifact.artifactKey,
                });
            }
        }

        return shared;
    }

    private buildOperationIndex(items: TStrictFlatOptions[]): Record<string, string> {
        const index: Record<string, string> = {};
        for (const item of items) {
            const specItem = this.getSpecItemName(item.input);
            // operationIds would come from parsed spec — for swarm manifest we track by specItem
            // Since we don't have parsed operations here, we register the specItem namespace
            if (!(specItem in index)) {
                index[specItem] = specItem;
            }
        }
        return index;
    }

    private getSpecItemName(input: string): string {
        const parts = input.replace(/\\/g, '/').split('/');
        const filename = parts[parts.length - 1] ?? input;
        return filename.replace(/\.[^.]+$/, '');
    }
}
