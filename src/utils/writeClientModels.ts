import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

import type { Model } from '../client/interfaces/Model';
import { dirName } from './path';
import { HttpClient } from '../HttpClient';
import { writeFile } from './fileSystem';
import { format } from './format';
import { Templates } from './registerHandlebarTemplates';

/**
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 */
interface IWriteClientModels {
    models: Model[];
    templates: Templates;
    outputPath: string;
    httpClient: HttpClient;
    useUnionTypes: boolean;
}

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param models Array of Models to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useUnionTypes Use union types instead of enums
 */
export async function writeClientModels(options: IWriteClientModels): Promise<void> {
    const { models, templates, outputPath, httpClient, useUnionTypes } = options;
    for (const model of models) {
        const dir = dirName(model.path);
        if (dir) {
            const directory = resolve(outputPath, dir);
            // @ts-ignore
            mkdirSync(directory, { recursive: true });
        }
        const file = resolve(outputPath, `${model.path}.ts`);
        const templateResult = templates.exports.model({
            ...model,
            httpClient,
            useUnionTypes,
        });
        await writeFile(file, format(templateResult));
    }
}
