export type SwarmConfig = {
    enabled?: boolean;
    output?: string;
};

export type SwarmSharedModel = {
    name: string;
    kind: string;
    usedBy: string[];
    artifactKey?: string;
};

export type AvatarDescriptor = {
    specItem: string;
    input: string;
    output: string;
    reuseHits: number;
    reuseMisses: number;
    operationIds: string[];
};

export type SwarmManifest = {
    version: 1;
    generatedAt: string;
    avatars: AvatarDescriptor[];
    sharedModels: SwarmSharedModel[];
    operationIndex: Record<string, string>;
};
