import { resolveHelper } from '../../common/utils/pathHelpers';
import { Context } from '../../core/Context';
import { getOutputPaths } from '../../core/utils/getOutputPaths';

const SEMANTIC_DIFF_TMP_OUTPUT = './test/generated/.semantic-diff-tmp';

/**
 * Creates lightweight context for OpenAPI parsing in semantic diff mode.
 */
export function createSemanticDiffContext(input: string): Context {
    return new Context({
        input: resolveHelper(process.cwd(), input),
        output: getOutputPaths({ output: SEMANTIC_DIFF_TMP_OUTPUT }),
    });
}
