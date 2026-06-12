import { collectOperationDiagnostics } from '../../governance/collectOperationDiagnostics';
import { createFinding, type DetectorContext } from '../detectorUtils';
import { SpecFindingCategoryEnum } from '../types';

export function detectMissingOperationId(ctx: DetectorContext) {
    const diagnostics = collectOperationDiagnostics(ctx.spec).filter(item => item.ruleId === 'REQUIRE_OPERATION_ID');

    if (diagnostics.length === 0) {
        return [];
    }

    return [
        createFinding(SpecFindingCategoryEnum.MissingOperationId, 'medium', `Found ${diagnostics.length} operation(s) without operationId; generated method names may be unstable`, {
            affectedPaths: diagnostics.map(item => item.operationPath),
            suggestedAction: 'Add operationId to each operation for stable generated method names',
            specInput: ctx.specInput,
        }),
    ];
}
