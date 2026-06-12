import { OptionValues } from 'commander';
import path from 'path';

import { APP_LOGGER } from '../../common/Consts';
import { validateZodOptions } from '../../common/Validation';
import { ProjectProbe } from '../../core/projectProbe';
import { loadDiffReport } from '../../core/utils/loadDiffReport';
import { AnalyzeUsageOptions, analyzeUsageOptionsSchema } from '../schemas';
import { CLICommandResult } from '../types';
import { Analyzer } from './core/Analyzer';
import { Scanner } from './core/Scanner';
import { Stats } from './types';
import { createApiImportScope } from './utils/apiImportScope';
import { checkRenameMiracles } from './utils/checkRenameMiracles';
import { Reporter } from './utils/report';

export const analyzeUsage = async (options: OptionValues): Promise<CLICommandResult> => {
    const validationResult = validateZodOptions(analyzeUsageOptionsSchema, options);

    if (!validationResult.success) {
        const message = validationResult.errors.join('\n');
        console.error(`❌ Error: ${message}`);
        return { success: false, error: message };
    }

    try {
        const validatedOptions = validationResult.data as AnalyzeUsageOptions;
        const projectPath = path.resolve(validatedOptions.projectPath!);
        const sourcePath = path.resolve(validatedOptions.sourcePath!);
        const apiScope = createApiImportScope(sourcePath);

        console.log('🏗️  Initializing project context...');
        const profile = ProjectProbe.probe({
            dir: projectPath,
            tsconfigPath: validatedOptions.tsconfigPath ? path.resolve(validatedOptions.tsconfigPath) : undefined,
        });
        const context = profile.consumer.context;

        const generatedFile = context.project.addSourceFileAtPath(sourcePath);

        console.log('🔍 Scanning API contract...');
        const scanner = new Scanner(generatedFile);
        const contract = scanner.scan();

        const stats: Stats = {
            usedMethods: new Set<string>(),
            usedSchemas: new Set<string>(),
            usedModels: new Set<string>(),
        };

        console.log('🧪 Running semantic analysis...');
        const analyzer = new Analyzer(context, contract, apiScope);
        const findings = await analyzer.run(stats);

        if (validatedOptions.diffReport) {
            const diffReportPath = path.resolve(validatedOptions.diffReport);
            const diffReport = loadDiffReport({
                diffReport: diffReportPath,
                logger: APP_LOGGER,
            });

            if (diffReport?.miracles?.length) {
                const renameFindings = checkRenameMiracles(context, contract, apiScope, diffReport.miracles);
                if (renameFindings.length > 0) {
                    console.log(`🔎 Diff report post-check: ${renameFindings.length} rename miracle warning(s).`);
                }
                findings.push(...renameFindings);
            }
        }

        const coverage = Reporter.calculateCoverage(stats, contract);

        Reporter.renderConsole(findings, coverage);

        Reporter.saveJsonReport(validatedOptions.output!, findings, coverage);

        if (validatedOptions.check) {
            const hasErrors = findings.some(f => f.severity === 'ERROR');
            if (hasErrors) {
                console.error('\n🛑 CI check failed: critical API contract mismatches were found.');
                return { success: false, error: 'CI check failed: critical API contract mismatches were found.' };
            }
        }

        console.log('\n✅ Done!');
        return { success: true };
    } catch (error: any) {
        console.error(`\n💥 Fatal error: ${error.message}`);
        return { success: false, error: error?.message ?? String(error) };
    }
};
