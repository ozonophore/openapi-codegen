import { writeConfigFile } from "./writeConfigFile";

export async function generateConfigExample(data: Record<string, any>, configPath: string): Promise<void> {
    await writeConfigFile({
        data,
        configPath,
        isUpdating: false,
    });
}