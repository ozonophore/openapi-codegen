import type { SemanticDiffReport } from '../../semanticDiff/analyzeOpenApiDiff';
import type { StructuralDiffPart } from '../../types/DiffReport.model';
import { semanticChangesToDiffEntries } from '../semanticChangesToDiffEntries';
import { extractMiraclesFromSemantic } from './extractMiraclesFromSemantic';

/** Минимальный набор полей семантического diff для адаптации в структурный формат. */
export type SemanticDiffLike = Pick<SemanticDiffReport, 'changes' | 'miracles'>;

function calculateStats(all: StructuralDiffPart['diff']['all'], ignored?: number): StructuralDiffPart['stats'] {
    const breakingCount = all.filter(entry => entry.severity === 'breaking').length;
    const stabilityScore = all.length === 0 ? 100 : Math.round(((all.length - breakingCount) / all.length) * 100);

    return {
        totalChanges: all.length,
        added: all.filter(entry => entry.action === 'added').length,
        removed: all.filter(entry => entry.action === 'removed').length,
        changed: all.filter(entry => entry.action === 'changed').length,
        ignored: ignored || undefined,
        stabilityScore,
    };
}

/**
 * Преобразует семантический diff в структурную часть legacy-отчёта.
 * @param semantic семантический diff или его подмножество
 * @param [ignored] количество проигнорированных изменений
 * @returns структурная часть diff-отчёта
 */
export function adaptSemanticToStructural(semantic: SemanticDiffLike, ignored?: number): StructuralDiffPart {
    const all = semanticChangesToDiffEntries(semantic.changes);

    return {
        diff: {
            breaking: all.filter(entry => entry.severity === 'breaking'),
            warnings: all.filter(entry => entry.severity === 'warning'),
            info: all.filter(entry => entry.severity === 'info'),
            all,
        },
        miracles: extractMiraclesFromSemantic(semantic.changes, semantic.miracles),
        stats: calculateStats(all, ignored),
    };
}
