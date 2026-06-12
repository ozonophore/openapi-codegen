export enum SpecFindingCategoryEnum {
    CircularSchemaRefs = 'circular-schema-refs',
    DeeplyNestedSchema = 'deeply-nested-schema',
    InconsistentResponseTypes = 'inconsistent-response-types',
    AmbiguousModelName = 'ambiguous-model-name',
    DeprecatedInActivePaths = 'deprecated-in-active-paths',
    MissingOperationId = 'missing-operation-id',
    EmptyOrUntypedSchema = 'empty-or-untyped-schema',
    CrossSpecNameHashConflict = 'cross-spec-name-hash-conflict',
    CrossSpecReuseOpportunity = 'cross-spec-reuse-opportunity',
    CrossSpecDrift = 'cross-spec-drift',
    SharedOutputCollisionRisk = 'shared-output-collision-risk',
}

export type SpecFindingCategory = `${SpecFindingCategoryEnum}`;

export type SpecFindingSeverity = 'high' | 'medium' | 'low' | 'info';

export type SpecFinding = {
    id: string;
    category: SpecFindingCategory;
    severity: SpecFindingSeverity;
    description: string;
    affectedPaths?: string[];
    suggestedAction?: string;
    specInput?: string;
};

export type SpecAnalysisSummary = {
    high: number;
    medium: number;
    low: number;
    info: number;
};

export type SpecAnalysisReport = {
    perSpec: SpecFinding[];
    crossSpec: SpecFinding[];
    summary: SpecAnalysisSummary;
};

export type CrossSpecItemConfig = {
    name: string;
    input: string;
    outputModels: string;
    outputSchemas: string;
};
