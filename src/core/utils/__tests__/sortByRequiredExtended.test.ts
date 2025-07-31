import assert from 'node:assert';
import { describe, test } from 'node:test';

import { TPropertyGroupExtended } from '../../types/Models';
import { OperationParameter } from '../../types/shared/OperationParameter.model';
import { createOperationParameter } from '../__mocks__/createOperationParameter';
import { sortByRequiredExtended } from '../sortByRequiredExtended';

describe('sortByRequiredExtended', () => {
    // Тесты для сравнения между разными группами
    test('@unit: должна сортировать группы в порядке: required, required-with-default, optional, optional-with-default', () => {
        const params = [
            createOperationParameter('optional', { isRequired: false }),                 // Группа 2
            createOperationParameter('required', { isRequired: true }),                  // Группа 0
            createOperationParameter('optional-with-default', { isRequired: false, default: 'def' }), // Группа 3
            createOperationParameter('required-with-default', { isRequired: true, default: 'def' })   // Группа 1
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, [
            'required',
            'required-with-default',
            'optional',
            'optional-with-default'
        ]);
    });

    // Тесты для сравнения внутри групп
    test('@unit: должна сортировать по имени внутри группы required', () => {
        const params = [
            createOperationParameter('Beta', { isRequired: true }),
            createOperationParameter('Alpha', { isRequired: true }),
            createOperationParameter('Gamma', { isRequired: true })
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, ['Alpha', 'Beta', 'Gamma']);
    });

    test('@unit: должна сортировать по имени внутри группы required-with-default', () => {
        const params = [
            createOperationParameter('Zeta', { isRequired: true, default: 'def' }),
            createOperationParameter('Beta', { isRequired: true, default: 'def' }),
            createOperationParameter('Alpha', { isRequired: true, default: 'def' })
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, ['Alpha', 'Beta', 'Zeta']);
    });

    test('@unit: должна сортировать по имени внутри группы optional', () => {
        const params = [
            createOperationParameter('Second', { isRequired: false }),
            createOperationParameter('First', { isRequired: false }),
            createOperationParameter('Third', { isRequired: false })
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, ['First', 'Second', 'Third']);
    });

    test('@unit: должна сортировать по имени внутри группы optional-with-default', () => {
        const params = [
            createOperationParameter('Dog', { isRequired: false, default: 'def' }),
            createOperationParameter('Cat', { isRequired: false, default: 'def' }),
            createOperationParameter('Bird', { isRequired: false, default: 'def' })
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, ['Bird', 'Cat', 'Dog']);
    });

    // Тесты для всех возможных пар групп
    const groupPairs: [TPropertyGroupExtended, TPropertyGroupExtended][] = [
        ['required', 'required-with-default'],
        ['required', 'optional'],
        ['required', 'optional-with-default'],
        ['required-with-default', 'optional'],
        ['required-with-default', 'optional-with-default'],
        ['optional', 'optional-with-default']
    ];

    for (const [groupA, groupB] of groupPairs) {
        test(`@unit: должна помещать "${groupA}" перед "${groupB}"`, () => {
            const paramA = createOperationParameter('A', createOptionsForGroup(groupA));
            const paramB = createOperationParameter('B', createOptionsForGroup(groupB));
            
            // A должен идти перед B
            assert.ok(sortByRequiredExtended(paramA, paramB) < 0);
            // B должен идти после A
            assert.ok(sortByRequiredExtended(paramB, paramA) > 0);
        });
    }

    // Вспомогательная функция для создания параметров по группе
    function createOptionsForGroup(group: TPropertyGroupExtended): Partial<OperationParameter> {
        switch (group) {
            case 'required': 
                return { isRequired: true };
            case 'required-with-default': 
                return { isRequired: true, default: 'default' };
            case 'optional': 
                return { isRequired: false };
            case 'optional-with-default': 
                return { isRequired: false, default: 'default' };
        }
    }

    // Тесты на равные группы
    test('@unit: должна возвращать 0 для одинаковых параметров', () => {
        const param1 = createOperationParameter('Test', { isRequired: true });
        const param2 = createOperationParameter('Test', { isRequired: true });
        
        assert.strictEqual(sortByRequiredExtended(param1, param2), 0);
    });

    // Тест на обработку параметров с одинаковыми именами
    test('@unit: должна возвращать 0 для параметров с одинаковыми именами в одной группе', () => {
        const param1 = createOperationParameter('Same', { isRequired: false, default: 'def' });
        const param2 = createOperationParameter('Same', { isRequired: false, default: 'def' });
        
        assert.strictEqual(sortByRequiredExtended(param1, param2), 0);
    });

    // Тест на смешанные группы с одинаковыми приоритетами
    test('@unit: должна сортировать только по имени при одинаковых группах', () => {
        const params = [
            createOperationParameter('Beta', { isRequired: false }),          // optional
            createOperationParameter('Alpha', { isRequired: true }),           // required
            createOperationParameter('Gamma', { isRequired: false }),          // optional
            createOperationParameter('Delta', { isRequired: true, default: 'def' }),  // required-with-default
            createOperationParameter('Epsilon', { isRequired: false, default: 'def' }), // optional-with-default
            createOperationParameter('Alpha2', { isRequired: true })           // required
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, [
            'Alpha',    // required
            'Alpha2',   // required
            'Delta',    // required-with-default
            'Beta',     // optional
            'Gamma',    // optional
            'Epsilon'   // optional-with-default
        ]);
    });

    // Тест на пограничные случаи
    test('@unit: должна корректно обрабатывать пустые имена', () => {
        const params = [
            createOperationParameter('', { isRequired: true }),
            createOperationParameter('B', { isRequired: true }),
            createOperationParameter('A', { isRequired: true })
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, ['', 'A', 'B']);
    });
});
