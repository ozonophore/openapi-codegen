import type { DiffReport } from '../types/DiffReport.model';
import type { MiracleEntry } from '../types/shared/Miracle.model';

/**
 * Извлекает RENAME miracles из diff-отчёта для подсказок в migration guide.
 */
export function extractRenameMiraclesFromDiffReport(report: DiffReport): MiracleEntry[] {
    return (report.miracles ?? []).filter(miracle => miracle.type === 'RENAME');
}
