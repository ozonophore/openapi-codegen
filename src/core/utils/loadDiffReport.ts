import fs from 'fs';

import { DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../common/Consts';
import type { Logger } from '../../common/Logger';
import type { DiffInfo } from '../types/shared/DiffInfo.model';
import type { MiracleEntry } from '../types/shared/Miracle.model';

export interface DiffReportEntry extends DiffInfo {
    action: DiffInfo['action'];
}

export interface DiffReport {
    version?: string;
    timestamp?: string;
    metadata?: {
        base?: string;
        target?: string;
        baseHash?: string;
        targetHash?: string;
    };
    stats?: {
        totalChanges?: number;
        added?: number;
        removed?: number;
        changed?: number;
        ignored?: number;
    };
    diff?: {
        breaking?: DiffReportEntry[];
        warnings?: DiffReportEntry[];
        info?: DiffReportEntry[];
        all?: DiffReportEntry[];
    };
    miracles?: MiracleEntry[];
}

type LoadDiffReportParams = {
    useHistory?: boolean;
    diffReport?: string;
    inputPath?: string;
    logger: Logger;
};

const isFreshEnough = (reportPath: string, inputPath?: string): boolean => {
    if (!inputPath) return true;
    try {
        const reportStat = fs.statSync(reportPath);
        const inputStat = fs.statSync(inputPath);
        return reportStat.mtimeMs >= inputStat.mtimeMs;
    } catch {
        return true;
    }
};

export const loadDiffReport = ({ useHistory, diffReport, inputPath, logger }: LoadDiffReportParams): DiffReport | null => {
    const shouldLoad = useHistory || !!diffReport;
    if (!shouldLoad) return null;

    const reportPath = diffReport || DEFAULT_ANALYZE_DIFF_REPORT_PATH;
    if (!fs.existsSync(reportPath)) {
        logger.info(`[openapi-codegen] Diff report not found at "${reportPath}". Skipping history annotations.`);
        return null;
    }

    if (!isFreshEnough(reportPath, inputPath)) {
        logger.warn(`[openapi-codegen] Diff report "${reportPath}" is older than the input spec. Skipping history annotations.`);
        return null;
    }

    try {
        const raw = fs.readFileSync(reportPath, 'utf-8');
        const parsed = JSON.parse(raw) as DiffReport;
        const hasDiffEntries = !!parsed?.diff?.all?.length;
        const hasMiracles = !!parsed?.miracles?.length;
        if (!hasDiffEntries && !hasMiracles) {
            logger.info(`[openapi-codegen] Diff report "${reportPath}" has no entries. Skipping history annotations.`);
            return null;
        }
        return parsed;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`[openapi-codegen] Failed to read diff report "${reportPath}": ${message}`);
        return null;
    }
};
