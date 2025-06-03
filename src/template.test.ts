import fs from 'fs/promises';
import Handlebars from 'handlebars';
import path from 'path';

import partialIsRequired from './templates/partials/isRequired.hbs';
import partialType from './templates/partials/type.hbs';

// Регистрируем вспомогательные подшаблоны (заглушки)
Handlebars.registerPartial('isRequired', Handlebars.template(partialIsRequired)); // Пример для TS optional
Handlebars.registerPartial('type', Handlebars.template(partialType)); // Базовый тип

const testCases = [
    {
        name: 'Object style with two params',
        data: {
            useOptions: true,
            parameters: [
                { name: 'param1', description: 'First param', type: 'string' },
                { name: 'param2', default: '100', type: 'number' },
            ],
        },
        expected: `{
param1,
param2 = 100
}: {
/**
 * First param
 */
param1?: any,
param2?: any
}`,
    },
    {
        name: 'Regular style with no defaults',
        data: {
            useOptions: false,
            parameters: [
                { name: 'username', type: 'string' },
                { name: 'age', type: 'number' },
            ],
        },
        expected: 'username?: any,\nage?: any',
    },
    {
        name: 'Empty parameters',
        data: {
            useOptions: true,
            parameters: [],
        },
        expected: '',
    },
];

async function runTests() {
    const templatePath = path.resolve(__dirname, './templates/partials/parameters.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);

    for (const testCase of testCases) {
        console.log(`\n--- Test: ${testCase.name} ---`);
        const result = template(testCase.data);

        console.log('Result:\n', result);
        console.log('Expected:\n', testCase.expected);

        if (result.trim() === testCase.expected.trim()) {
            console.log('✅ PASSED');
        } else {
            console.error('❌ FAILED');
            // Детальное сравнение
            console.log('Char-by-char comparison:');
            result.split('').forEach((char, i) => {
                if (char !== testCase.expected[i]) {
                    console.log(`Diff at ${i}: '${char}' vs '${testCase.expected[i]}'`);
                }
            });
        }
    }
}

runTests().catch(console.error);
