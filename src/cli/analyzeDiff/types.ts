export type JsonValue = unknown;

export type DiffAction = 'added' | 'removed' | 'changed';

export type DiffSeverity = 'breaking' | 'warning' | 'info';

export interface DiffEntry {
    action: DiffAction;
    path: string;
    from?: JsonValue;
    to?: JsonValue;
    severity: DiffSeverity;
    note?: string;
    type?: string;
}

export interface DiffStats {
    totalChanges: number;
    added: number;
    removed: number;
    changed: number;
    ignored?: number;
    stabilityScore?: number;
}

export interface DiffReport {
    version: string;
    timestamp: string;
    metadata: {
        base: string;
        target: string;
        baseHash?: string;
        targetHash?: string;
    };
    stats: DiffStats;
    diff: {
        breaking: DiffEntry[];
        warnings: DiffEntry[];
        info: DiffEntry[];
        all: DiffEntry[];
    };
    miracles: MiracleEntry[];
}

export type MiracleType = 'RENAME' | 'TYPE_COERCION';

export type MiracleStatus = 'auto-generated' | 'confirmed';

export interface MiracleEntry {
    oldPath: string;
    newPath: string;
    type: MiracleType;
    confidence: number;
    status: MiracleStatus;
}

export type IgnoreRule = {
    path?: string;
    pattern?: string;
    reason?: string;
    until?: string;
};

export type AnalyzeDiffResult = {
    success: boolean;
    reportPath?: string;
    skipped?: boolean;
    ignored?: number;
    error?: string;
};