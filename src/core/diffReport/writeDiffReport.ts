import path from 'path';

import { fileSystemHelpers } from '../../common/utils/fileSystemHelpers';
import { format } from '../../common/utils/format';
import { resolveHelper } from '../../common/utils/pathHelpers';
import type { SemanticDiffReport } from '../semanticDiff/analyzeOpenApiDiff';
import type { UnifiedDiffReport } from './DiffReport.model';

/**
 * Writes a semantic or unified Diff report JSON file.
 * @returns absolute path to the saved file
 */
export async function writeDiffReport(report: SemanticDiffReport | UnifiedDiffReport, reportFilePath: string): Promise<string> {
    const resolvedPath = resolveHelper(process.cwd(), reportFilePath);
    const directory = path.dirname(resolvedPath);

    const directoryExists = await fileSystemHelpers.exists(directory);
    if (!directoryExists) {
        await fileSystemHelpers.mkdir(directory);
    }

    const reportContent = await format(JSON.stringify(report), 'json');
    await fileSystemHelpers.writeFile(resolvedPath, reportContent);

    return resolvedPath;
}
