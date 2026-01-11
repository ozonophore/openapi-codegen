import { fileSystemHelpers } from "../../../common/utils/fileSystemHelpers";
import { joinHelper, relativeHelper } from "../../../common/utils/pathHelpers";

/**
 * Рекурсивно читает все файлы в директории
 */
export async function readDirectoryRecursive(dirPath: string, basePath: string = dirPath): Promise<string[]> {
    const files: string[] = [];
    const entries = await fileSystemHelpers.readdir(dirPath);

    for (const entry of entries) {
        const fullPath = joinHelper(dirPath, entry);
        let relativePath = relativeHelper(basePath, fullPath);
        // Убираем префикс ./ если он есть
        if (relativePath.startsWith('./')) {
            relativePath = relativePath.substring(2);
        }

        if (fileSystemHelpers.isDirectory(fullPath)) {
            const subFiles = await readDirectoryRecursive(fullPath, basePath);
            files.push(...subFiles);
        } else if (fileSystemHelpers.isPathToFile(fullPath)) {
            files.push(relativePath);
        }
    }

    return files;
}