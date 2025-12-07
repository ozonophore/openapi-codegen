import { BuiltInParserName, format as prettierFormat,LiteralUnion } from 'prettier';

export async function format(input: string, parser?: LiteralUnion<BuiltInParserName>): Promise<string> {
    try {
        const formatedCode = await prettierFormat(input, {
            parser: parser ?? 'typescript',
            tabWidth: 4,
            printWidth: 120,
            useTabs: false,
            singleQuote: true,
            quoteProps: 'as-needed',
            trailingComma: 'all',
            bracketSpacing: true,
            arrowParens: 'avoid',
            endOfLine: 'auto',
        });

        return formatedCode;
    } catch {
        throw new Error('Could not to format the value via prettier');
    }
}
