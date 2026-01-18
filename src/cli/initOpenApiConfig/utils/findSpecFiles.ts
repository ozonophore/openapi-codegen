import path from 'path';

import { fileSystemHelpers } from '../../../common/utils/fileSystemHelpers';
import { joinHelper, resolveHelper } from '../../../common/utils/pathHelpers';

const SPEC_EXTENSIONS = ['.json', '.yaml', '.yml'];

/**
 * Находит все файлы спецификаций в директории
 * @param specsDir - Путь к директории со спецификациями
 * @returns Массив путей к файлам спецификаций
 * @throws {Error} Если директория не существует или не является директорией
 */
export async function findSpecFiles(specsDir: string): Promise<string[]> {
    const resolvedDir = resolveHelper(process.cwd(), specsDir);
    const dirExists = await fileSystemHelpers.exists(resolvedDir);
    
    if (!dirExists) {
        throw new Error(`Directory does not exist: ${specsDir}`);
    }

    const isDir = fileSystemHelpers.isDirectory(resolvedDir);
    if (!isDir) {
        throw new Error(`Path is not a directory: ${specsDir}`);
    }

    const files = await fileSystemHelpers.readdir(resolvedDir);
    const specFiles: string[] = [];

    for (const file of files) {
        const filePath = joinHelper(resolvedDir, file);
        const isFile = fileSystemHelpers.isPathToFile(filePath);
        
        if (isFile) {
            const ext = path.extname(file).toLowerCase();
            if (SPEC_EXTENSIONS.includes(ext)) {
                specFiles.push(filePath);
            }
        }
    }

    return specFiles;
}