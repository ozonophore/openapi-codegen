import { createFinding, type DetectorContext, extractResourceName, getSchemaTypeSignature } from '../detectorUtils';
import { SpecFindingCategoryEnum } from '../types';

function getSuccessResponseSignature(responses: Record<string, unknown>): string | null {
    for (const [status, response] of Object.entries(responses)) {
        if (!/^2/.test(status)) {
            continue;
        }

        const responseRecord = response as Record<string, unknown>;
        const content = responseRecord.content as Record<string, Record<string, { schema?: unknown }>> | undefined;
        if (content) {
            const mediaTypes = Object.keys(content).sort();
            const schemaSignatures = mediaTypes.map(mediaType => {
                const schema = content[mediaType]?.schema;
                return `${mediaType}:${getSchemaTypeSignature(schema)}`;
            });
            return schemaSignatures.join('|');
        }

        if (responseRecord.schema) {
            return `legacy:${getSchemaTypeSignature(responseRecord.schema)}`;
        }
    }

    return null;
}

function findResponseInconsistencies(operations: Array<{ path: string; method: string; responses: Record<string, unknown> }>): Array<{ path: string }> {
    const signatures = new Map<string, string>();

    for (const operation of operations) {
        const signature = getSuccessResponseSignature(operation.responses);
        if (!signature) {
            continue;
        }
        signatures.set(`${operation.method.toUpperCase()} ${operation.path}`, signature);
    }

    const uniqueSignatures = new Set(signatures.values());
    if (uniqueSignatures.size <= 1) {
        return [];
    }

    return Array.from(signatures.keys()).map(pathKey => ({ path: pathKey }));
}

export function detectInconsistentResponseTypes(ctx: DetectorContext) {
    const resourceGroups = new Map<string, Array<{ path: string; method: string; responses: Record<string, unknown> }>>();

    ctx.walker.forEachOperation(({ path, method, operation }) => {
        const resource = extractResourceName(path);
        if (!resourceGroups.has(resource)) {
            resourceGroups.set(resource, []);
        }

        const responses = (operation.responses as Record<string, unknown> | undefined) ?? {};
        resourceGroups.get(resource)!.push({ path, method, responses });
    });

    const findings = [];
    for (const [resource, operations] of resourceGroups.entries()) {
        if (operations.length < 2) {
            continue;
        }

        const inconsistencies = findResponseInconsistencies(operations);
        if (inconsistencies.length === 0) {
            continue;
        }

        findings.push(
            createFinding(SpecFindingCategoryEnum.InconsistentResponseTypes, 'medium', `Endpoints for "${resource}" return inconsistent 2xx response types; client methods may get wide unions`, {
                id: `inconsistent-${resource}`,
                affectedPaths: inconsistencies.map(item => item.path),
                suggestedAction: 'Normalize response schemas across related endpoints for the same resource',
                specInput: ctx.specInput,
            })
        );
    }

    return findings;
}
