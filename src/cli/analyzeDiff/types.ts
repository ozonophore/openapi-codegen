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

export type IgnoreRule = {
    path?: string;
    pattern?: string;
    reason?: string;
    until?: string;
};
