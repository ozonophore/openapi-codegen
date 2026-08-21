import { DEFAULT_ANALYZE_DIFF_REPORT_PATH } from '../../common/Consts';
import type { Logger } from '../../common/Logger';
import { LOGGER_MESSAGES } from '../../common/LoggerMessages';
import type { Context } from '../Context';
import type { Client } from '../types/shared/Client.model';
import type { OpenApiVersion } from '../utils/getOpenApiVersion';
import { applyDiffReportToClient } from './applyDiffReportToClient';
import { loadDiffReport } from './loadDiffReport';

type MiraclesConfig = {
    enabled?: boolean;
    confidence?: number;
    types?: Array<'RENAME' | 'TYPE_COERCION'>;
};

export type ApplyHistoryDiffToClientInput = {
    client: Client;
    openApi: Record<string, unknown>;
    openApiVersion: OpenApiVersion;
    context: Context;
    miracles?: MiraclesConfig;
    useHistory?: boolean;
    diffReport?: string;
    inputPath?: string;
    logger: Logger;
};

/**
 * Generation-path useHistory: load Diff report → warn if missing → apply to Client.
 * Does not own parse/postProcess; warn is not inside `loadDiffReport`.
 */
export function applyHistoryDiffToClient(input: ApplyHistoryDiffToClientInput): Client {
    const loaded = loadDiffReport({
        useHistory: input.useHistory,
        diffReport: input.diffReport,
        inputPath: input.inputPath,
        logger: input.logger,
    });

    if (input.useHistory && !loaded) {
        const reportPath = input.diffReport || DEFAULT_ANALYZE_DIFF_REPORT_PATH;
        input.logger.warn(LOGGER_MESSAGES.DIFF_REPORT.USE_HISTORY_NO_REPORT(reportPath));
    }

    return applyDiffReportToClient({
        client: input.client,
        openApi: input.openApi,
        openApiVersion: input.openApiVersion,
        diffReport: loaded,
        prefix: input.context.prefix,
        context: input.context,
        miraclesConfig: input.miracles,
    });
}
