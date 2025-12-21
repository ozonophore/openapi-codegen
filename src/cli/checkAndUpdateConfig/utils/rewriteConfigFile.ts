import { writeConfigFile } from "./writeConfigFile";

export async function rewriteConfigFile(data: Record<string, any>, configPath: string): Promise<void> {
    await writeConfigFile({
        data,
        configPath,
        isUpdating: true,
    });
}