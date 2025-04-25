import { copyFileSync } from 'fs';

export const copyAsset = (fileNameIn: string, fileNameOut: string) => {
    copyFileSync(`./test/e2e/assets/${fileNameIn}`, `./e2e-tests/generated/${fileNameOut}`);
};
