import { dirname } from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { SwarmConfig, SwarmManifest } from './types';

export async function writeSwarmOutput(manifest: SwarmManifest, config: SwarmConfig): Promise<void> {
    const outputPath = resolveHelper(process.cwd(), config.output ?? './swarm-manifest.json');
    await fileSystemHelpers.mkdir(dirname(outputPath));
    await fileSystemHelpers.writeFile(outputPath, JSON.stringify(manifest, null, 2));
}
