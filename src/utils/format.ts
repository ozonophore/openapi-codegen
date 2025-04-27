import { format as prettierFormat } from 'prettier';

export function format(input: string): string {
    const formatedCode = prettierFormat(input, {
        parser: 'typescript',
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
}
