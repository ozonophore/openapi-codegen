import { createFinding, type DetectorContext } from '../detectorUtils';
import { SpecFindingCategoryEnum } from '../types';

export function detectDeprecatedInActivePaths(ctx: DetectorContext) {
    const deprecatedPaths: string[] = [];

    ctx.walker.forEachOperation(({ path, method, operation }) => {
        if (operation.deprecated === true) {
            deprecatedPaths.push(`${method.toUpperCase()} ${path}`);
        }
    });

    if (deprecatedPaths.length === 0) {
        return [];
    }

    return [
        createFinding(
            SpecFindingCategoryEnum.DeprecatedInActivePaths,
            'low',
            `Found ${deprecatedPaths.length} deprecated operation(s) still present in paths; generated services will include dead methods`,
            {
                affectedPaths: deprecatedPaths,
                suggestedAction: 'Remove deprecated operations or exclude them from generation',
                specInput: ctx.specInput,
            }
        ),
    ];
}
