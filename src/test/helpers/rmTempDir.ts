import { rmSync } from 'node:fs';

function sleepSync(ms: number): void {
    const end = Date.now() + ms;
    while (Date.now() < end) {
        // wait for Windows file handles to release
    }
}

/**
 * Remove a test temp directory. Retries on EBUSY, then ignores leftover EBUSY.
 * Not for production rmdir.
 */
export function rmTempDir(dir: string, retries = 3): void {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            rmSync(dir, { recursive: true, force: true });
            return;
        } catch (error) {
            const code = (error as NodeJS.ErrnoException).code;
            if (code !== 'EBUSY') {
                throw error;
            }
            if (attempt === retries - 1) {
                return;
            }
            sleepSync(50 * (attempt + 1));
        }
    }
}
