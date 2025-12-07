import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getRefs } from '../getRefs';

describe('@unit: getRefs', () => {
    test('should return array of refs', () => {
        const object = {
            name: 'NAME',
            $ref: '#/first/ref',
            innerObject: {
                $ref: '#/first/ref',
                innerObject: {
                    $ref: '#/second/ref',
                },
            },
        };
        const refs = getRefs(object);
        assert.deepStrictEqual(refs, ['#/first/ref', '#/second/ref']);
    });
});
