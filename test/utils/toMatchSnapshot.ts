import assert from 'node:assert/strict';

import fs from 'fs';
import path from 'path';

/**
 * Creating snapshot files for unit test results.
 * @param received The content for recording.
 * @param snapshotFile The path for the snapshot file.
 */
export function toMatchSnapshot(received: string, snapshotFile: string): void {
    const dir = path.dirname(snapshotFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const isUpdate = process.env.UPDATE_SNAPSHOTS === 'true';

    if (!fs.existsSync(snapshotFile)) {
        // the first run — we create a snapshot
        fs.writeFileSync(snapshotFile, received, 'utf8');
        console.log(`Snapshot created: ${snapshotFile}`);
        return;
    }

    const expected = fs.readFileSync(snapshotFile, 'utf8').replace(/\r\n/g, '\n');
    const receivedNormalized = received.replace(/\r\n/g, '\n');
    if (receivedNormalized !== expected) {
        if (isUpdate) {
            // overwriting an existing snapshot
            fs.writeFileSync(snapshotFile, received, 'utf8');
            console.log(`Snapshot updated: ${snapshotFile}`);
        } else {
            // we throw an error and show the diff
            assert.strictEqual(receivedNormalized, expected, `Snapshot mismatch: ${snapshotFile}\n` + `   Run with UPDATE_SNAPSHOTS=true to update.`);
        }
    }
}
