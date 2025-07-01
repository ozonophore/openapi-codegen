import fs from 'fs';

import { isValidJson } from '../cli/utils';
import { resolve } from '../core/utils/pathHelpers';

const CONFIG_FILE_NAME = 'openapi.config.json';

export function loadConfigIfExists() {
    const configFilePath = resolve(process.cwd(), CONFIG_FILE_NAME);
    let configData: Record<string, any> | Record<string, any> | null;

    if (fs.existsSync(configFilePath)) {
        const dataString = fs.readFileSync(configFilePath, { encoding: 'utf-8' });
        configData = isValidJson(dataString) ? JSON.parse(dataString) : [];
    } else {
        configData = null;
    }

    return configData;
}

