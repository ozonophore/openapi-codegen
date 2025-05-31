import { getRefs } from './getRefs';

describe('getRefs', () => {
    it('should return array of refs', () => {
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
        expect(refs).toEqual(expect.arrayContaining(['#/first/ref', '#/second/ref']));
    });
});
