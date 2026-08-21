import { relativeHelper, resolveHelper } from '../common/utils/pathHelpers';
import type { CoreOutputAdapter } from './CoreOutputAdapter';
import { ClientArtifacts } from './types/base/ClientArtifacts.model';
import { ExportedModel } from './types/base/ExportedModel.model';
import { ExportedService } from './types/base/ExportedService.model';
import { OutputPaths } from './types/base/OutputPaths.model';
import { SimpleClientArtifacts } from './types/base/SimpleClientArtifacts.model';
import { Templates } from './types/base/Templates.model';
import { EmptySchemaStrategy } from './types/enums/EmptySchemaStrategy.enum';
import { ModelsLayout } from './types/enums/ModelsLayout.enum';
import { ModelsMode } from './types/enums/ModelsMode.enum';
import { ValidationLibrary } from './types/enums/ValidationLibrary.enum';
import type { Client } from './types/shared/Client.model';
import type { Model } from './types/shared/Model.model';
import { prepareAlias } from './utils/prepareAlias';
import { sortModelByName } from './utils/sortModelByName';
import { unique } from './utils/unique';
import { writeClientFullIndex } from './write/writeClientFullIndex';
import { writeClientSimpleIndex } from './write/writeClientSimpleIndex';

/** Per-item generator config accumulated for batch index combine. */
export type APIClientGeneratorConfig = {
    client: Client;
    templates: Templates;
    outputPaths: OutputPaths;
    useUnionTypes: boolean;
    excludeCoreServiceFiles: boolean;
    validationLibrary?: ValidationLibrary;
    emptySchemaStrategy: EmptySchemaStrategy;
    schemaModels: Model[];
    modelsMode?: ModelsMode;
    modelsLayout?: ModelsLayout;
};

/**
 * Owns per-item generator config accumulation and batch index combine flush.
 */
export class IndexCombineSession {
    private config: Map<string, APIClientGeneratorConfig[]> = new Map();

    register(config: APIClientGeneratorConfig): void {
        const { outputPaths } = config;
        const values = this.config.get(outputPaths.output);
        if (values) {
            values.push(config);
        } else {
            this.config.set(outputPaths.output, Array.of(config));
        }
    }

    async combineAndWrite(adapter: CoreOutputAdapter): Promise<void> {
        const result = this.buildClientIndexMap();
        await this.finalizeAndWrite(result, adapter);
    }

    async combineAndWrightSimple(adapter: CoreOutputAdapter): Promise<void> {
        const result = this.buildSimpleClientIndexMap();
        await this.simpledFinalizeAndWrite(result, adapter);
    }

    private buildSimpleClientIndexMap(): Map<string, SimpleClientArtifacts> {
        const result: Map<string, SimpleClientArtifacts> = new Map<string, SimpleClientArtifacts>();
        for (const [key, value] of this.config.entries()) {
            for (const item of value) {
                const { outputPaths, templates, excludeCoreServiceFiles, validationLibrary, schemaModels } = item;
                const outputCore = this.getOutputPath(outputPaths?.outputCore, key, 'core');
                const outputModels = this.getOutputPath(outputPaths?.outputModels, key, 'models');
                const outputSchemas = this.getOutputPath(outputPaths?.outputSchemas, key, 'schemas');
                const outputServices = this.getOutputPath(outputPaths?.outputServices, key, 'services');

                const clientIndex = this.ensureSimpleClientIndex(result, key, templates);

                if (!excludeCoreServiceFiles) {
                    const relativePathCore = relativeHelper(key, outputCore);
                    if (!clientIndex.core.includes(relativePathCore)) {
                        clientIndex.core.push(relativePathCore);
                    }

                    const relativeService = relativeHelper(key, outputServices);
                    if (!clientIndex.services.includes(relativeService)) {
                        clientIndex.services.push(relativeService);
                    }
                }

                const relativePathModel = relativeHelper(key, outputModels);
                if (!clientIndex.models.includes(relativePathModel)) {
                    clientIndex.models.push(relativePathModel);
                }

                if (validationLibrary !== ValidationLibrary.NONE && schemaModels.length > 0) {
                    const relativePathSchema = relativeHelper(key, outputSchemas);
                    if (!clientIndex.schemas.includes(relativePathSchema)) {
                        clientIndex.schemas.push(relativePathSchema);
                    }
                }
            }
        }

        return result;
    }

    private buildClientIndexMap(): Map<string, ClientArtifacts> {
        const result: Map<string, ClientArtifacts> = new Map<string, ClientArtifacts>();
        for (const [key, value] of this.config.entries()) {
            for (const item of value) {
                const { outputPaths, client, templates, useUnionTypes, excludeCoreServiceFiles, validationLibrary, schemaModels, modelsMode, modelsLayout } = item;
                const outputCore = this.getOutputPath(outputPaths?.outputCore, key, 'core');
                const outputModels = this.getOutputPath(outputPaths?.outputModels, key, 'models');
                const outputSchemas = this.getOutputPath(outputPaths?.outputSchemas, key, 'schemas');
                const outputServices = this.getOutputPath(outputPaths?.outputServices, key, 'services');

                const clientIndex = this.ensureClientIndex(result, key, templates);
                if (!clientIndex.modelsMode) {
                    clientIndex.modelsMode = modelsMode;
                }
                if (!clientIndex.modelsLayout) {
                    clientIndex.modelsLayout = modelsLayout;
                }

                if (!excludeCoreServiceFiles) {
                    const rel = relativeHelper(key, outputCore);
                    if (!clientIndex.core.includes(rel)) {
                        clientIndex.core.push(rel);
                    }

                    const relativeService = `${relativeHelper(key, outputServices)}`;
                    for (const service of client.services) {
                        if (!clientIndex.services.some(s => this.isSomeService(s, service.name, relativeService))) {
                            clientIndex.services.push({
                                name: service.name,
                                package: relativeService,
                            });
                        }
                    }
                }

                const relativePathModel = `${relativeHelper(key, outputModels)}`;
                if (!clientIndex.modelsPackage) {
                    clientIndex.modelsPackage = relativePathModel;
                }
                const relativePathSchema = `${relativeHelper(key, outputSchemas)}`;
                for (const model of client.models) {
                    const modelFinal = {
                        name: model.name,
                        alias: '',
                        path: model.path,
                        package: relativePathModel,
                        enum: model.enum && model.enum.length > 0,
                        useUnionTypes,
                        enums: model.enums && model.enums.length > 0,
                    };

                    if (!clientIndex.models.some(m => this.isSameModel(m, modelFinal))) {
                        clientIndex.models.push(modelFinal);
                    }

                    if (validationLibrary !== ValidationLibrary.NONE && schemaModels.some(schemaModel => schemaModel.name === model.name && schemaModel.path === model.path)) {
                        const schema = { ...modelFinal, package: relativePathSchema };

                        if (!clientIndex.schemas.some(s => this.isSameShema(s, schema))) {
                            clientIndex.schemas.push(schema);
                        }
                    }
                }
            }
        }

        return result;
    }

    private async finalizeAndWrite(result: Map<string, ClientArtifacts>, adapter: CoreOutputAdapter): Promise<void> {
        for (const value of result.values()) {
            value.models = value.models.filter(unique).sort(sortModelByName);
            prepareAlias(value.models);
            value.schemas = value.schemas.filter(unique).sort(sortModelByName);
            prepareAlias(value.schemas);
            await writeClientFullIndex(adapter, value);
        }
    }

    private async simpledFinalizeAndWrite(result: Map<string, SimpleClientArtifacts>, adapter: CoreOutputAdapter): Promise<void> {
        for (const value of result.values()) {
            await writeClientSimpleIndex(adapter, value);
        }
    }

    private getOutputPath(output: string | undefined, key: string, fallback: string) {
        return output ? output : resolveHelper(key, fallback);
    }

    private ensureClientIndex(map: Map<string, ClientArtifacts>, key: string, templates: Templates): ClientArtifacts {
        if (!map.has(key)) {
            map.set(key, {
                templates,
                outputPath: key,
                core: [],
                models: [],
                schemas: [],
                services: [],
                modelsMode: undefined,
                modelsLayout: undefined,
                modelsPackage: undefined,
            });
        }

        return map.get(key)!;
    }

    private ensureSimpleClientIndex(map: Map<string, SimpleClientArtifacts>, key: string, templates: Templates): SimpleClientArtifacts {
        if (!map.has(key)) {
            map.set(key, {
                templates,
                outputPath: key,
                core: [],
                models: [],
                schemas: [],
                services: [],
            });
        }

        return map.get(key)!;
    }

    private isSameModel(a: ExportedModel, b: ExportedModel): boolean {
        return a.name === b.name && a.path === b.path && a.package === b.package && a.enum === b.enum && a.enums === b.enums && a.useUnionTypes === b.useUnionTypes;
    }

    private isSameShema(a: ExportedModel, b: ExportedModel): boolean {
        return a.name === b.name && a.path === b.path && a.package === b.package;
    }

    private isSomeService(a: ExportedService, name: string, pkg: string): boolean {
        return a.name === name && a.package === pkg;
    }
}
