import { BuiltInParserName, format as prettierFormat, LiteralUnion, Options as PrettierOptions, resolveConfig } from 'prettier';

import { APP_LOGGER } from '../Consts';
import { LOGGER_ERROR_CODES, LOGGER_MESSAGES } from '../LoggerMessages';

const BUILTIN_PRETTIER_OPTIONS: PrettierOptions = {
    tabWidth: 4,
    printWidth: 120,
    useTabs: false,
    singleQuote: true,
    quoteProps: 'as-needed',
    trailingComma: 'all',
    bracketSpacing: true,
    arrowParens: 'avoid',
    endOfLine: 'auto',
};

export async function format(
    input: string,
    parser?: LiteralUnion<BuiltInParserName>,
    useProjectConfig?: boolean,
): Promise<string> {
    let options: PrettierOptions = { ...BUILTIN_PRETTIER_OPTIONS, parser: parser ?? 'typescript' };

    if (useProjectConfig) {
        try {
            const resolved = await resolveConfig(process.cwd(), { useCache: false });
            if (resolved) {
                APP_LOGGER.info(LOGGER_MESSAGES.FORMATTING.PRETTIER_PROJECT_CONFIG_RESOLVED(process.cwd()));
                options = { ...resolved, parser: parser ?? (resolved.parser as LiteralUnion<BuiltInParserName>) ?? 'typescript' };
            } else {
                APP_LOGGER.warn(LOGGER_MESSAGES.FORMATTING.PRETTIER_PROJECT_CONFIG_NOT_FOUND);
            }
        } catch {
            APP_LOGGER.warn(LOGGER_MESSAGES.FORMATTING.PRETTIER_PROJECT_CONFIG_NOT_FOUND);
        }
    }

    try {
        const formatedCode = await prettierFormat(input, options);
        return formatedCode;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        APP_LOGGER.errorWithHint({
            code: LOGGER_ERROR_CODES.PRETTIER_FORMAT_FAILED,
            message: LOGGER_MESSAGES.FORMATTING.PRETTIER_FORMAT_FAILED('(generated content)', message),
            error,
        });
        throw new Error(`Could not format the value via prettier: ${message}`);
    }
}
