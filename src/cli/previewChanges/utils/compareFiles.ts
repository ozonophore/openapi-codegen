import * as diff from 'diff';

import { fileSystemHelpers } from "../../../common/utils/fileSystemHelpers";

/**
 * Сравнивает два файла и возвращает diff
 */
export async function compareFiles(oldPath: string, newPath: string): Promise<diff.Change[] | null> {
    const oldContent = await fileSystemHelpers.readFile(oldPath, 'utf-8');
    const newContent = await fileSystemHelpers.readFile(newPath, 'utf-8');
    const fileDiff = diff.diffLines(oldContent, newContent);

    if (fileDiff.some(part => part.added || part.removed)) {
        return fileDiff;
    }

    return null;
}