import type { Logger } from '../../common/Logger';
import type { TStrictFlatOptions } from '../../common/TRawOptions';
import { resolveHelper } from '../../common/utils/pathHelpers';
import { Parser as ParserV2 } from '../api/v2/Parser';
import { Parser as ParserV3 } from '../api/v3/Parser';
import { Context } from '../Context';
import { hashSchema } from '../reuseStore/ArtifactFingerprinter';
import { buildModelSchemaMap } from '../reuseStore/reuseHelpers';
import { getOpenApiSpec } from '../utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from '../utils/getOpenApiVersion';
import { buildManifestFromParsedSpecs, runCrossSpecAnalysis } from './CrossSpecAnalyzer';

export async function runPreAnalyze(items: TStrictFlatOptions[], logger: Logger): Promise<void> {
    logger.forceInfo('[preAnalyze] Starting cross-spec pre-generation analysis...');

    const parsedEntries: Array<{ specItem: string; schemas: Record<string, Record<string, unknown>> }> = [];

    for (const item of items) {
        const absoluteInput = resolveHelper(process.cwd(), item.input);
        const specItem = getSpecItemName(item.input);

        try {
            const context = new Context({
                input: absoluteInput,
                output: {
                    output: item.output,
                    outputCore: item.outputCore || item.output,
                    outputServices: item.outputServices || item.output,
                    outputModels: item.outputModels || item.output,
                    outputSchemas: item.outputSchemas || item.output,
                },
                prefix: {
                    interface: item.interfacePrefix,
                    enum: item.enumPrefix,
                    type: item.typePrefix,
                },
                sortByRequired: item.sortByRequired,
                plugins: [],
            });

            const openApi = await getOpenApiSpec(context, absoluteInput);
            const version = getOpenApiVersion(openApi);

            if (version === OpenApiVersion.V2) {
                new ParserV2(context).parse(openApi as any);
            } else if (version === OpenApiVersion.V3) {
                new ParserV3(context).parse(openApi as any);
            }

            const schemaMap = buildModelSchemaMap(context);
            const schemas: Record<string, Record<string, unknown>> = {};
            for (const [name, schema] of schemaMap.entries()) {
                schemas[name] = schema;
            }

            parsedEntries.push({ specItem, schemas });
            logger.forceInfo(`[preAnalyze] Parsed: ${specItem} (${Object.keys(schemas).length} models)`);
        } catch (err: any) {
            logger.warn(`[preAnalyze] Failed to parse ${item.input}: ${err.message}`);
        }
    }

    if (parsedEntries.length === 0) {
        logger.forceInfo('[preAnalyze] No specs could be parsed, skipping analysis.');
        return;
    }

    const manifest = buildManifestFromParsedSpecs(parsedEntries, schema => hashSchema(schema));
    const crossSpecItems = items.map(item => ({
        name: getSpecItemName(item.input),
        input: item.input,
        outputModels: item.outputModels,
        outputSchemas: item.outputSchemas,
    }));
    const findings = runCrossSpecAnalysis(manifest, crossSpecItems);

    const sharedModels = findings.filter(f => f.category === 'cross-spec-reuse-opportunity');
    const conflicts = findings.filter(f => f.category === 'cross-spec-name-hash-conflict');

    logger.forceInfo('[preAnalyze] ─────────────────────────────────────');
    logger.forceInfo(`[preAnalyze] Shared models: ${sharedModels.length}`);
    logger.forceInfo(`[preAnalyze] Conflicts:     ${conflicts.length}`);

    if (sharedModels.length > 0) {
        const top5 = sharedModels.slice(0, 5);
        logger.forceInfo('[preAnalyze] Top shared models:');
        for (const f of top5) {
            logger.forceInfo(`[preAnalyze]   - ${f.description}`);
        }
    }

    if (conflicts.length > 0) {
        logger.forceInfo('[preAnalyze] Conflicts:');
        for (const f of conflicts) {
            logger.forceInfo(`[preAnalyze]   - ${f.description}`);
        }
    }

    logger.forceInfo('[preAnalyze] ─────────────────────────────────────');
}

function getSpecItemName(input: string): string {
    const parts = input.replace(/\\/g, '/').split('/');
    const filename = parts[parts.length - 1] ?? input;
    return filename.replace(/\.[^.]+$/, '');
}
