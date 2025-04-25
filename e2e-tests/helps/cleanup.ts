import { rmSync } from 'fs';

export const cleanup = (dir: string) => {
    rmSync(`./e2e-tests/generated/${dir}/`, {
        force: true,
        recursive: true,
    });
};
