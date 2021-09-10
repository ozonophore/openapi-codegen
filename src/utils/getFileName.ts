import { basename, extname } from 'path';

export function getFileName(value: any): string {
    const postfix = extname(value);
    const fileName = basename(value);
    if (!postfix) {
        return fileName;
    }
    return fileName.substr(0, fileName.length - postfix.length);
}
