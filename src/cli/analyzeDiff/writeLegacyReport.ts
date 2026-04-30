import fs from 'fs';
import path from 'path';

import { DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../common/Consts';
import { logLegacyReport } from './logLegacyReport';
import { DiffReport } from './types';

/**
 * Сохраняет legacy report на диск и логирует summary.
 */
export function writeLegacyReport(report: DiffReport, reportPath: string = DEFAULT_ANALYZE_DIFF_REPORT_PATH): void {
    const reportDir = path.dirname(reportPath);

    if (reportDir && reportDir !== '.' && !fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    logLegacyReport(report, reportPath);
}
