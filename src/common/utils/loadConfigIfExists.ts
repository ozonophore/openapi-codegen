import fs from 'fs';

import { isValidJson } from '../../cli/utils';
import { DEFAULT_OPENAPI_CONFIG_FILENAME } from '../Consts';
import { resolveHelper } from './pathHelpers';

export function loadConfigIfExists(configPath?: string) {
    const configFilePath = resolveHelper(process.cwd(), configPath ?? DEFAULT_OPENAPI_CONFIG_FILENAME);
    let configData: Record<string, any> | Record<string, any>[] | null;

    if (fs.existsSync(configFilePath)) {
        const dataString = fs.readFileSync(configFilePath, { encoding: 'utf-8' });
        configData = isValidJson(dataString) ? JSON.parse(dataString) : [];
    } else {
        configData = null;
    }

    return configData;
}
