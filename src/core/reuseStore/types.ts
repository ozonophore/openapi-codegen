import type { TStrictFlatOptions } from '../../common/TRawOptions';

export type ArtifactKind = 'model' | 'schema' | 'enum';

export type OptionsSlice = Pick<
    TStrictFlatOptions,
    | 'validationLibrary'
    | 'useUnionTypes'
    | 'interfacePrefix'
    | 'enumPrefix'
    | 'typePrefix'
    | 'modelsMode'
    | 'sortByRequired'
    | 'emptySchemaStrategy'
    | 'useSeparatedIndexes'
    | 'httpClient'
    | 'prettierConfigPath'
> & {
    pluginsHash: string;
};

export type ManifestReference = {
    specItem: string;
    outputPath: string;
};

export type ManifestArtifact = {
    artifactKey: string;
    name: string;
    kind: ArtifactKind;
    schemaHash: string;
    optionsSliceHash: string;
    relativePath: string;
    contentHash: string;
    byteSize: number;
    firstSeenSpec: string;
    referencedBy: ManifestReference[];
    createdAt: string;
    updatedAt: string;
};

export type ManifestSpecItem = {
    input: string;
    lastGeneratedAt: string;
    artifactKeys: string[];
};

export type ReuseStoreManifest = {
    version: number;
    generatorVersion: string;
    updatedAt: string;
    artifacts: Record<string, ManifestArtifact>;
    specItems: Record<string, ManifestSpecItem>;
};

export type ReuseLookupResult =
    | { status: 'hit'; artifactKey: string; entry: ManifestArtifact }
    | { status: 'miss'; artifactKey: string; schemaHash: string; optionsSliceHash: string }
    | { status: 'conflict'; existing: ManifestArtifact; incomingSchemaHash: string; artifactKey: string };

export type ReuseConflictErrorDetails = {
    name: string;
    kind: ArtifactKind;
    existingSpec: string;
    incomingSpec: string;
    existingSchemaHash: string;
    incomingSchemaHash: string;
};

export class ReuseConflictError extends Error {
    readonly details: ReuseConflictErrorDetails;

    constructor(details: ReuseConflictErrorDetails) {
        super(
            `${details.kind.charAt(0).toUpperCase() + details.kind.slice(1)} "${details.name}" schema mismatch between "${details.existingSpec}" and "${details.incomingSpec}"\n` +
                `  ${details.existingSpec}:     schemaHash=${details.existingSchemaHash.slice(0, 8)}...\n` +
                `  ${details.incomingSpec}: schemaHash=${details.incomingSchemaHash.slice(0, 8)}...\n` +
                `  Hint: rename component in one spec, or set reuseOnConflict: "namespace"`
        );
        this.name = 'ReuseConflictError';
        this.details = details;
    }
}
