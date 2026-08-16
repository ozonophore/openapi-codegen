import type { SemanticDiffChange } from '../../semanticDiff/analyzeOpenApiDiff';
import type { MiracleEntry } from '../../types/shared/Miracle.model';
import { buildMiraclesFromSemanticChanges } from '../buildMiraclesFromSemanticChanges';

/**
 * Возвращает miracles из отчёта или строит их из семантических изменений.
 * @param changes список семантических изменений
 * @param [miracles] готовый список miracles из отчёта
 * @returns список miracles для структурного diff
 */
export function extractMiraclesFromSemantic(changes: SemanticDiffChange[], miracles?: MiracleEntry[]): MiracleEntry[] {
    return miracles?.length ? miracles : buildMiraclesFromSemanticChanges(changes);
}
