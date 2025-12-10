import fs from 'fs';

import { isValidJson } from '../../cli/utils';
import { resolve } from '../../core/utils/pathHelpers';
import { DEFAULT_OPENAPI_CONFIG_FILENAME } from '../Consts';

export function loadConfigIfExists(configPath?: string) {
    const configFilePath = resolve(process.cwd(), configPath ?? DEFAULT_OPENAPI_CONFIG_FILENAME);
    let configData: Record<string, any> | Record<string, any>[] | null;

    if (fs.existsSync(configFilePath)) {
        const dataString = fs.readFileSync(configFilePath, { encoding: 'utf-8' });
        configData = isValidJson(dataString) ? JSON.parse(dataString) : [];
    } else {
        configData = null;
    }

    return configData;
}
