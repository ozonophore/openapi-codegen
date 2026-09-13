import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { Parser as ParserV2 } from '../api/v2/Parser';
import { Parser as ParserV3 } from '../api/v3/Parser';
import { createResolvedContext } from '../createResolvedContext';
import type { Operation } from '../types/shared/Operation.model';
import { getOutputPaths } from '../utils/getOutputPaths';

const generatedRoot = path.join(__dirname, '../../../test/generated');

describe('@unit: Follow after parameter and requestBody $ref', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    function startTmp(): string {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'follow-after-ref-'));
        return tmpDir;
    }

    test('OAS3: nested relative Tree $ref joins from the component file', async () => {
        const root = startTmp();
        const componentsDir = path.join(root, 'components');
        mkdirSync(componentsDir);

        writeFileSync(
            path.join(componentsDir, 'pet-id.yaml'),
            `type: object
properties:
  followIdMarker:
    type: string
`,
            'utf8'
        );
        writeFileSync(
            path.join(componentsDir, 'pet-body.yaml'),
            `type: object
properties:
  followBodyMarker:
    type: string
`,
            'utf8'
        );
        writeFileSync(
            path.join(componentsDir, 'inline-nested.yaml'),
            `type: object
properties:
  followInlineMarker:
    type: string
`,
            'utf8'
        );
        writeFileSync(
            path.join(componentsDir, 'params.yaml'),
            `components:
  parameters:
    PetId:
      name: id
      in: path
      required: true
      schema:
        $ref: './pet-id.yaml'
    InlineFilter:
      name: filter
      in: query
      schema:
        type: object
        properties:
          nested:
            $ref: './inline-nested.yaml'
`,
            'utf8'
        );
        writeFileSync(
            path.join(componentsDir, 'bodies.yaml'),
            `components:
  requestBodies:
    PetBody:
      required: true
      content:
        application/json:
          schema:
            $ref: './pet-body.yaml'
`,
            'utf8'
        );
        const specPath = path.join(root, 'api.yaml');
        writeFileSync(
            specPath,
            `openapi: "3.0.0"
info:
  title: Follow after ref
  version: "1.0.0"
paths:
  /pets/{id}:
    put:
      operationId: putPet
      parameters:
        - $ref: './components/params.yaml#/components/parameters/PetId'
        - $ref: './components/params.yaml#/components/parameters/InlineFilter'
      requestBody:
        $ref: './components/bodies.yaml#/components/requestBodies/PetBody'
      responses:
        '200':
          description: ok
`,
            'utf8'
        );

        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(root, 'out') }),
        });
        const client = new ParserV3(context).parse(openApi as never);
        const operation = onlyOperation(client.services[0]?.operations);

        const petId = operation.parametersPath.find(parameter => parameter.prop === 'id');
        assert.ok(petId, 'path parameter id');
        assert.match(petId.type, /PetId/);

        const filter = operation.parametersQuery.find(parameter => parameter.prop === 'filter');
        assert.ok(filter, 'query parameter filter');
        const nested = filter.properties.find(property => property.name === 'nested');
        assert.ok(nested, 'inline schema nested property');
        assert.match(nested.type, /InlineNested/);

        const body = operation.parametersBody;
        assert.ok(body, 'requestBody');
        assert.match(body.type, /PetBody/);
    });

    test('OAS2: nested relative Tree $ref joins from the parameter file', async () => {
        const root = startTmp();
        writeFileSync(
            path.join(root, 'pet-id.yaml'),
            `type: object
properties:
  followIdMarker:
    type: string
`,
            'utf8'
        );
        writeFileSync(
            path.join(root, 'parameters.yaml'),
            `parameters:
  PetBody:
    name: body
    in: body
    required: true
    schema:
      $ref: './pet-id.yaml'
`,
            'utf8'
        );
        const specPath = path.join(root, 'api.yaml');
        writeFileSync(
            specPath,
            `swagger: "2.0"
info:
  title: Follow after ref OAS2
  version: "1.0.0"
paths:
  /pets:
    post:
      operationId: createPet
      parameters:
        - $ref: './parameters.yaml#/parameters/PetBody'
      responses:
        200:
          description: ok
`,
            'utf8'
        );

        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(root, 'out') }),
        });
        const client = new ParserV2(context).parse(openApi as never);
        const operation = onlyOperation(client.services[0]?.operations);
        const body = operation.parametersBody;
        assert.ok(body, 'OAS2 body parameter');
        assert.match(body.type, /PetId/);
    });
});

function onlyOperation(operations: Operation[] | undefined): Operation {
    assert.equal(operations?.length, 1, 'one operation');
    return operations[0];
}
