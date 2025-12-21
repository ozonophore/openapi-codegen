import { fileSystemHelpers } from "../../common/utils/fileSystemHelpers";

export async function appendUniqueLinesToFile(filePath: string, data: string) {
    try {
        let existingContent = '';
        const fileExists = await fileSystemHelpers.exists(filePath);
        if (fileExists) {
            existingContent = await fileSystemHelpers.readFile(filePath, "utf8");
        }

        const existingLines = existingContent.split(/\r?\n/).filter(Boolean);
        const dataLines = data.split(/\r?\n/).filter(Boolean);
        const linesToAdd = dataLines.filter(line => !existingLines.includes(line.trim()));
        if (linesToAdd.length === 0) {
            return;
        }

        const updatedContent = existingContent + linesToAdd.join('\n') + '\n';
        await fileSystemHelpers.writeFile(filePath, updatedContent);
    } catch (error: any) {
        throw new Error(`Error when writing to a file: ${error?.message}`);
    }
}