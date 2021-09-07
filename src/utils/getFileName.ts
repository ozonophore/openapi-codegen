import { extname } from 'path';

export function getFileName(value: any): string {
    const fileName = extname(value);
    const index = fileName.indexOf('.');
    if (index === -1) {
        return fileName;
    }
    return fileName.substr(0, index);
}
