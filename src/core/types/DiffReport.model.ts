import type { GovernanceReport } from '../governance/evaluateGovernanceRules';
import type { SemanticDiffChange, SemanticDiffRecommendation, SemanticDiffSummary } from '../semanticDiff/analyzeOpenApiDiff';
import type { DiffInfo } from './shared/DiffInfo.model';
import type { MiracleEntry } from './shared/Miracle.model';

/** Версия схемы унифицированного diff-отчёта. */
export const UNIFIED_DIFF_REPORT_SCHEMA_VERSION = '2.0.0';

/** Запись структурного diff с обязательным действием изменения. */
export interface DiffReportEntry extends DiffInfo {
    action: DiffInfo['action'];
}

/**
 * Метаданные diff-отчёта.
 * @property [base] источник базовой спецификации
 * @property [target] источник целевой спецификации
 * @property [baseHash] хеш базовой спецификации
 * @property [targetHash] хеш целевой спецификации
 */
export interface DiffReportMetadata {
    base?: string;
    target?: string;
    baseHash?: string;
    targetHash?: string;
}

/**
 * Статистика изменений в diff-отчёте.
 * @property [totalChanges] общее количество изменений
 * @property [added] количество добавлений
 * @property [removed] количество удалений
 * @property [changed] количество изменений
 * @property [ignored] количество проигнорированных изменений
 * @property [stabilityScore] оценка стабильности API в процентах
 */
export interface DiffReportStats {
    totalChanges?: number;
    added?: number;
    removed?: number;
    changed?: number;
    ignored?: number;
    stabilityScore?: number;
}

/**
 * Структурная часть diff-отчёта для генерации клиента.
 * @property diff группы изменений по уровню серьёзности
 * @property miracles кандидаты на переименование и приведение типов
 * @property stats агрегированная статистика изменений
 */
export interface StructuralDiffPart {
    diff: {
        breaking: DiffReportEntry[];
        warnings: DiffReportEntry[];
        info: DiffReportEntry[];
        all: DiffReportEntry[];
    };
    miracles: MiracleEntry[];
    stats: DiffReportStats;
}

/**
 * Legacy diff-отчёт для обратной совместимости.
 * @property [version] версия схемы отчёта
 * @property [timestamp] время формирования отчёта
 * @property [metadata] метаданные сравниваемых спецификаций
 * @property [stats] статистика изменений
 * @property [diff] группы изменений по уровню серьёзности
 * @property [miracles] кандидаты на переименование и приведение типов
 */
export interface DiffReport {
    version?: string;
    timestamp?: string;
    metadata?: DiffReportMetadata;
    stats?: DiffReportStats;
    diff?: {
        breaking?: DiffReportEntry[];
        warnings?: DiffReportEntry[];
        info?: DiffReportEntry[];
        all?: DiffReportEntry[];
    };
    miracles?: MiracleEntry[];
}

/**
 * Унифицированный diff-отчёт с семантической и структурной частями.
 * @property schemaVersion версия схемы отчёта
 * @property timestamp время формирования отчёта
 * @property metadata метаданные сравниваемых спецификаций
 * @property semantic семантический анализ изменений
 * @property structural структурная часть для генерации клиента
 */
export interface UnifiedDiffReport {
    schemaVersion: typeof UNIFIED_DIFF_REPORT_SCHEMA_VERSION;
    timestamp: string;
    metadata: DiffReportMetadata;
    semantic: {
        changes: SemanticDiffChange[];
        governance: GovernanceReport;
        recommendation: SemanticDiffRecommendation;
        summary: SemanticDiffSummary;
    };
    structural: StructuralDiffPart;
}

/** Реэкспорт типов структурного diff и miracles. */
export type { DiffInfo, MiracleEntry };
