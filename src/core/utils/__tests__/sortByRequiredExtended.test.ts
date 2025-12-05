import assert from 'node:assert';
import { describe, test } from 'node:test';

import { PropertyGroupExtended } from '../../types/base/PropertyGroup.model';
import { OperationParameter } from '../../types/shared/OperationParameter.model';
import { createOperationParameter } from '../__mocks__/createOperationParameter';
import { sortByRequiredExtended } from '../sortByRequiredExtended';

describe('sortByRequiredExtended', () => {
    // Tests for comparison between different groups
    test('@unit: must sort the groups in order: required, required-with-default, optional, optional-with-default', () => {
        const params = [
            createOperationParameter('optional', { isRequired: false }),
            createOperationParameter('required', { isRequired: true }),
            createOperationParameter('optional-with-default', { isRequired: false, default: 'def' }),
            createOperationParameter('required-with-default', { isRequired: true, default: 'def' })
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

    // Comparison tests within groups
    test('@unit: must sort by name within the required group', () => {
        const params = [
            createOperationParameter('Beta', { isRequired: true }),
            createOperationParameter('Alpha', { isRequired: true }),
            createOperationParameter('Gamma', { isRequired: true })
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, ['Alpha', 'Beta', 'Gamma']);
    });

    test('@unit: must sort by name within the required-with-default group', () => {
        const params = [
            createOperationParameter('Zeta', { isRequired: true, default: 'def' }),
            createOperationParameter('Beta', { isRequired: true, default: 'def' }),
            createOperationParameter('Alpha', { isRequired: true, default: 'def' })
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, ['Alpha', 'Beta', 'Zeta']);
    });

    test('@unit: it should sort by name within the optional group', () => {
        const params = [
            createOperationParameter('Second', { isRequired: false }),
            createOperationParameter('First', { isRequired: false }),
            createOperationParameter('Third', { isRequired: false })
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, ['First', 'Second', 'Third']);
    });

    test('@unit: it must sort by name within the optional-with-default group', () => {
        const params = [
            createOperationParameter('Dog', { isRequired: false, default: 'def' }),
            createOperationParameter('Cat', { isRequired: false, default: 'def' }),
            createOperationParameter('Bird', { isRequired: false, default: 'def' })
        ];
        
        params.sort(sortByRequiredExtended);
        
        const sortedNames = params.map(p => p.name);
        assert.deepStrictEqual(sortedNames, ['Bird', 'Cat', 'Dog']);
    });

    // Tests for all possible pairs of groups
    const groupPairs: [PropertyGroupExtended, PropertyGroupExtended][] = [
        ['required', 'required-with-default'],
        ['required', 'optional'],
        ['required', 'optional-with-default'],
        ['required-with-default', 'optional'],
        ['required-with-default', 'optional-with-default'],
        ['optional', 'optional-with-default']
    ];

    for (const [groupA, groupB] of groupPairs) {
        test(`@unit: must place "${groupA}" before "${groupB}"`, () => {
            const paramA = createOperationParameter('A', createOptionsForGroup(groupA));
            const paramB = createOperationParameter('B', createOptionsForGroup(groupB));
            
            // A should go before B
            assert.ok(sortByRequiredExtended(paramA, paramB) < 0);
            // B should come after A
            assert.ok(sortByRequiredExtended(paramB, paramA) > 0);
        });
    }

    // Auxiliary function for creating parameters by group
    function createOptionsForGroup(group: PropertyGroupExtended): Partial<OperationParameter> {
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

    // Tests for equal groups
    test('@unit: it should return 0 for identical parameters.', () => {
        const param1 = createOperationParameter('Test', { isRequired: true });
        const param2 = createOperationParameter('Test', { isRequired: true });
        
        assert.strictEqual(sortByRequiredExtended(param1, param2), 0);
    });

    // A test for processing parameters with the same name
    test('@unit: it should return 0 for parameters with the same name in the same group.', () => {
        const param1 = createOperationParameter('Same', { isRequired: false, default: 'def' });
        const param2 = createOperationParameter('Same', { isRequired: false, default: 'def' });
        
        assert.strictEqual(sortByRequiredExtended(param1, param2), 0);
    });

    // A test for mixed groups with the same priorities
    test('@unit: It should sort only by name for identical groups.', () => {
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

    // A test for borderline cases
    test('@unit: It must handle empty names correctly.', () => {
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
