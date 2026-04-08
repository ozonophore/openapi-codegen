export type DiffAction = 'added' | 'removed' | 'changed';

export type DiffSeverity = 'breaking' | 'warning' | 'info';

export interface DiffInfo {
    action: DiffAction;
    path: string;
    severity: DiffSeverity;
    from?: unknown;
    to?: unknown;
    previousType?: string;
    note?: string;
    type?: string;
}
