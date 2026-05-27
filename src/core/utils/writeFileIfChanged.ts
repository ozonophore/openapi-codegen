import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';

export type WriteFileIfChangedResult = 'written' | 'unchanged';

export async function writeFileIfChanged(filePath: string, nextContent: string): Promise<WriteFileIfChangedResult> {
    try {
        const fileExists = await fileSystemHelpers.exists(filePath);
        if (fileExists) {
            const currentContent = await fileSystemHelpers.readFile(filePath, 'utf8');
            if (currentContent === nextContent) {
                return 'unchanged';
            }
        }
    } catch (error: any) {
        if (error?.code !== 'ENOENT') {
            throw error;
        }
    }

    await fileSystemHelpers.writeFile(filePath, nextContent);
    return 'written';
}
