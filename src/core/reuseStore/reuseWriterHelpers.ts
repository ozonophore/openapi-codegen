import { dirname, join } from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import type { Model } from '../types/shared/Model.model';
import type { WriteClient } from '../WriteClient';
import { buildOptionsSliceHash, hashSchema } from './ArtifactFingerprinter';
import { computeStoreRelativeImport } from './computeStoreRelativeImport';
import {
    buildModelArtifactRelativePath,
    buildNamespacedModelArtifactRelativePath,
    buildNamespacedSchemaArtifactRelativePath,
    buildSchemaArtifactRelativePath,
    resolveModelSchema,
} from './reuseHelpers';
import { ReuseStore } from './ReuseStore';
import type { SharedFolderWriter } from './SharedFolderWriter';
import { SHARED_FOLDER_NAME } from './SharedFolderWriter';
import type { ArtifactKind, OptionsSlice } from './types';

export type ReuseWriterContext = {
    reuseStore: ReuseStore;
    optionsSlice: OptionsSlice;
    specInput: string;
    inputPath: string;
    modelSchemas: Map<string, Record<string, unknown>>;
    referencedArtifactKeys?: Set<string>;
    onReuseStat?: (hit: boolean) => void;
    reuseOnConflict?: 'fail' | 'namespace';
    prettierConfigPath?: string;
    /** auto-group: when provided, writes canonical to __shared__ and stubs at the regular file location */
    sharedFolderWriter?: SharedFolderWriter;
};

type ArtifactWriterConfig = {
    kind: ArtifactKind;
    file: string;
    model: Model;
    renderArtifact: () => Promise<string>;
    buildRelativePath: (model: Model, optionsSliceHash: string) => string;
    buildNamespacedPath: (model: Model, specItem: string, optionsSliceHash: string, schemaHash: string) => string;
    registerLintTarget?: (file: string) => void;
};

async function writeReusedArtifact(writeClient: WriteClient, ctx: ReuseWriterContext, config: ArtifactWriterConfig): Promise<void> {
    const { reuseStore, optionsSlice, specInput, inputPath, modelSchemas, referencedArtifactKeys, onReuseStat, reuseOnConflict = 'fail' } = ctx;
    const { kind, file, model, renderArtifact, buildRelativePath, buildNamespacedPath, registerLintTarget } = config;
    const schema = resolveModelSchema(model, modelSchemas);
    const lookup = reuseStore.lookup(model.name, kind, schema, optionsSlice);

    if (lookup.status === 'conflict') {
        if (reuseOnConflict === 'namespace') {
            const optionsSliceHash = buildOptionsSliceHash(optionsSlice);
            const schemaHash = hashSchema(schema);
            const relativeArtifactPath = buildNamespacedPath(model, specInput, optionsSliceHash, schemaHash);
            const formattedValue = await renderArtifact();
            await reuseStore.writeArtifact(relativeArtifactPath, formattedValue);
            const entry = reuseStore.register({
                name: model.name,
                kind,
                schema,
                optionsSlice,
                relativeArtifactPath,
                contentHash: ReuseStore.hashContent(formattedValue),
                specItem: specInput,
                inputPath,
                outputPath: file,
                byteSize: Buffer.byteLength(formattedValue, 'utf8'),
                skipConflictCheck: true,
            });
            await writeClient.writeOutputFile(file, formattedValue);
            referencedArtifactKeys?.add(entry.artifactKey);
            onReuseStat?.(false);
            registerLintTarget?.(file);
            return;
        }
        reuseStore.checkConflict(model.name, kind, schema, specInput);
    }

    if (lookup.status === 'hit') {
        const content = await reuseStore.readArtifactIfIntegrityOk(lookup.entry);
        if (content !== null) {
            if (ctx.sharedFolderWriter) {
                const kindDir = kind === 'schema' ? 'schemas' : kind === 'enum' ? 'enums' : 'models';
                const canonicalPath = join(ctx.sharedFolderWriter.lca, SHARED_FOLDER_NAME, kindDir, `${model.name}.ts`);
                await fileSystemHelpers.mkdir(dirname(canonicalPath));
                const stubImport = computeStoreRelativeImport(file, canonicalPath);
                const stubContent = `export * from '${stubImport}';\n`;
                await writeClient.writeOutputFile(canonicalPath, content);
                await writeClient.writeOutputFile(file, stubContent);
            } else {
                await writeClient.writeOutputFile(file, content, { expectedByteSize: lookup.entry.byteSize });
            }
            reuseStore.markReferenced(
                lookup.entry.artifactKey,
                {
                    specItem: specInput,
                    outputPath: file,
                },
                inputPath
            );
            referencedArtifactKeys?.add(lookup.entry.artifactKey);
            onReuseStat?.(true);
            registerLintTarget?.(file);
            return;
        }
    }

    const optionsSliceHash = lookup.status === 'miss' ? lookup.optionsSliceHash : buildOptionsSliceHash(optionsSlice);
    const formattedValue = await renderArtifact();
    const relativeArtifactPath = buildRelativePath(model, optionsSliceHash);
    await reuseStore.writeArtifact(relativeArtifactPath, formattedValue);
    const entry = reuseStore.register({
        name: model.name,
        kind,
        schema,
        optionsSlice,
        relativeArtifactPath,
        contentHash: ReuseStore.hashContent(formattedValue),
        specItem: specInput,
        inputPath,
        outputPath: file,
        byteSize: Buffer.byteLength(formattedValue, 'utf8'),
    });
    referencedArtifactKeys?.add(entry.artifactKey);
    onReuseStat?.(false);

    if (ctx.sharedFolderWriter) {
        const kindDir = kind === 'schema' ? 'schemas' : kind === 'enum' ? 'enums' : 'models';
        const canonicalPath = join(ctx.sharedFolderWriter.lca, SHARED_FOLDER_NAME, kindDir, `${model.name}.ts`);
        await fileSystemHelpers.mkdir(dirname(canonicalPath));
        const stubImport = computeStoreRelativeImport(file, canonicalPath);
        const stubContent = `export * from '${stubImport}';\n`;
        await writeClient.writeOutputFile(canonicalPath, formattedValue);
        await writeClient.writeOutputFile(file, stubContent);
        registerLintTarget?.(file);
        return;
    }

    await writeClient.writeOutputFile(file, formattedValue);
    registerLintTarget?.(file);
}

export async function writeModelWithReuse(
    writeClient: WriteClient,
    model: Model,
    file: string,
    outputModelsPath: string,
    ctx: ReuseWriterContext,
    renderArtifact: () => Promise<string>
): Promise<void> {
    await writeReusedArtifact(writeClient, ctx, {
        kind: model.export === 'enum' ? 'enum' : 'model',
        file,
        model,
        renderArtifact,
        buildRelativePath: buildModelArtifactRelativePath,
        buildNamespacedPath: buildNamespacedModelArtifactRelativePath,
        registerLintTarget: f => writeClient.registerLintTarget(f, outputModelsPath),
    });
}

export async function writeSchemaWithReuse(writeClient: WriteClient, model: Model, file: string, ctx: ReuseWriterContext, renderArtifact: () => Promise<string>): Promise<void> {
    await writeReusedArtifact(writeClient, ctx, {
        kind: 'schema',
        file,
        model,
        renderArtifact,
        buildRelativePath: buildSchemaArtifactRelativePath,
        buildNamespacedPath: buildNamespacedSchemaArtifactRelativePath,
    });
}

export async function formatArtifactContent(templateResult: string, prettierConfigPath?: string): Promise<string> {
    return format(templateResult, undefined, prettierConfigPath);
}
