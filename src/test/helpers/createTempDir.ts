import { mkdirSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import type { TestContext } from 'node:test';

import { rmTempDir } from './rmTempDir';

/**
 * Unique temp dir under cwd/tmp/test-runs with TestContext cleanup.
 *
 * Uses cwd (not os.tmpdir): generate requires output paths under process.cwd().
 * Avoids writing under src test trees named generated (leftover .ts break checkTypes).
 */
export function createTempDir(t: TestContext, prefix: string): string {
    const root = path.join(process.cwd(), 'tmp', 'test-runs');
    mkdirSync(root, { recursive: true });
    const tempDir = mkdtempSync(path.join(root, prefix));
    t.after(() => {
        rmTempDir(tempDir);
    });
    return tempDir;
}
