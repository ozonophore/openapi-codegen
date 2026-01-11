import { fileSystemHelpers } from "../../../common/utils/fileSystemHelpers";

/**
 * Проверяет, пуста ли директория
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
    if (!(await fileSystemHelpers.exists(dirPath))) {
        return true;
    }

    if (!fileSystemHelpers.isDirectory(dirPath)) {
        return true;
    }

    const entries = await fileSystemHelpers.readdir(dirPath);
    return entries.length === 0;
}