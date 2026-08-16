import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { Parser as ParserV2 } from '../api/v2/Parser';
import type { OpenApi as OpenApiV2 } from '../api/v2/types/OpenApi.model';
import { Parser as ParserV3 } from '../api/v3/Parser';
import type { OpenApi as OpenApiV3 } from '../api/v3/types/OpenApi.model';
import { createResolvedContext } from '../createResolvedContext';
import { buildModelSchemaMap } from '../reuseStore/reuseHelpers';
import { getOutputPaths } from '../utils/getOutputPaths';

const generatedRoot = path.join(__dirname, '../../../test/generated');

const OAS3_SHARED_NAME = `openapi: "3.0.0"
info:
  title: DuplicateName
  version: "1.0.0"
paths:
  /example:
    get:
      parameters:
        - $ref: '#/components/parameters/ErrorResponse'
      requestBody:
        $ref: '#/components/requestBodies/ErrorResponse'
      responses:
        '200':
          description: ok
          headers:
            X-Error:
              $ref: '#/components/headers/ErrorResponse'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '400':
          $ref: '#/components/responses/ErrorResponse'
components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        message:
          type: string
  responses:
    ErrorResponse:
      description: Error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
  parameters:
    ErrorResponse:
      name: ErrorResponse
      in: header
      schema:
        $ref: '#/components/schemas/ErrorResponse'
  headers:
    ErrorResponse:
      schema:
        $ref: '#/components/schemas/ErrorResponse'
  requestBodies:
    ErrorResponse:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
`;

const OAS3_REQUEST_BODY = `openapi: "3.0.0"
info:
  title: RequestBodyOnly
  version: "1.0.0"
paths:
  /example:
    post:
      requestBody:
        $ref: '#/components/requestBodies/SimpleRequestBody'
      responses:
        '200':
          description: ok
components:
  requestBodies:
    SimpleRequestBody:
      description: A reusable request body
      content:
        application/json:
          schema:
            type: object
            properties:
              message:
                type: string
`;

const OAS3_INLINE_RESPONSE = `openapi: "3.0.0"
info:
  title: InlineResponse
  version: "1.0.0"
paths:
  /example:
    get:
      responses:
        '400':
          $ref: '#/components/responses/ErrorResponse'
components:
  responses:
    ErrorResponse:
      description: Error
      content:
        application/json:
          schema:
            type: object
            properties:
              message:
                type: string
`;

const OAS2_SHARED_NAME = `swagger: "2.0"
info:
  title: DuplicateName
  version: "1.0.0"
paths:
  /example:
    get:
      responses:
        400:
          $ref: '#/responses/ErrorResponse'
definitions:
  ErrorResponse:
    type: object
    properties:
      message:
        type: string
responses:
  ErrorResponse:
    description: Error
    schema:
      $ref: '#/definitions/ErrorResponse'
`;

describe('@unit: getModels Model denylist', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    async function writeSpec(contents: string, fileName: string): Promise<string> {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'models-registry-'));
        const specPath = path.join(tmpDir, fileName);
        writeFileSync(specPath, contents, 'utf8');
        return specPath;
    }

    test('OAS3 schema + same-named response/parameter/header/requestBody yields one IErrorResponse Model', async () => {
        const specPath = await writeSpec(OAS3_SHARED_NAME, 'oas3.yaml');
        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const canonicalRefs = context.getAllCanonicalRefs();
        assert.ok(
            canonicalRefs.some(ref => ref.includes('#/components/responses/ErrorResponse')),
            'getAllCanonicalRefs must still include non-Model Canonical Refs'
        );
        assert.equal(context.exists('#/components/responses/ErrorResponse', specPath), true);

        const models = new ParserV3(context).getModels(openApi as OpenApiV3);
        assert.deepEqual(models.map(model => model.name).sort(), ['IErrorResponse']);
        assert.ok(!models.some(model => model.name === 'ErrorResponse'));

        const schemaByName = buildModelSchemaMap(context);
        const mapped = schemaByName.get('ErrorResponse');
        assert.ok(mapped);
        assert.equal(mapped.type, 'object');
        assert.ok(mapped.properties);
        assert.ok(!('content' in mapped));
        assert.notEqual(mapped.description, 'Error');
        assert.equal(schemaByName.size, 1);
    });

    test('OAS3 requestBodies Pointer is not an exported Model', async () => {
        const specPath = await writeSpec(OAS3_REQUEST_BODY, 'request-body.yaml');
        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const canonicalRefs = context.getAllCanonicalRefs();
        assert.ok(canonicalRefs.some(ref => ref.includes('#/components/requestBodies/SimpleRequestBody')));

        const models = new ParserV3(context).getModels(openApi as OpenApiV3);
        assert.ok(!models.some(model => model.name === 'SimpleRequestBody'));
        assert.equal(buildModelSchemaMap(context).has('SimpleRequestBody'), false);
    });

    test('OAS2 definition is a Model and #/responses/ is not', async () => {
        const specPath = await writeSpec(OAS2_SHARED_NAME, 'oas2.yaml');
        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const canonicalRefs = context.getAllCanonicalRefs();
        assert.ok(canonicalRefs.some(ref => ref.includes('#/definitions/ErrorResponse')));
        assert.ok(canonicalRefs.some(ref => ref.includes('#/responses/ErrorResponse')));

        const models = new ParserV2(context).getModels(openApi as OpenApiV2);
        assert.deepEqual(models.map(model => model.name).sort(), ['IErrorResponse']);
        assert.ok(!models.some(model => model.name === 'ErrorResponse'));
    });

    test('inline schema inside a Response Object is not an exported Model named after the response', async () => {
        const specPath = await writeSpec(OAS3_INLINE_RESPONSE, 'inline.yaml');
        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const models = new ParserV3(context).getModels(openApi as OpenApiV3);
        assert.ok(!models.some(model => model.name === 'ErrorResponse' || model.name === 'IErrorResponse'));
    });

    test('v3.withDifferentRefs.yml keeps INested and TProp from schema-document Pointers', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'models-registry-'));
        const specPath = path.join(__dirname, '../../../test/spec/v3.withDifferentRefs.yml');
        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const models = new ParserV3(context).getModels(openApi as OpenApiV3);
        const names = models.map(model => model.name);
        assert.ok(names.includes('INested'), `expected INested in ${names.join(', ')}`);
        assert.ok(names.includes('TProp'), `expected TProp in ${names.join(', ')}`);
        assert.ok(!names.includes('SimpleRequestBody'));

        const schemaByName = buildModelSchemaMap(context);
        const mapKeys = [...schemaByName.keys()];
        assert.ok(
            mapKeys.some(key => key.toLowerCase() === 'nested'),
            `expected nested in buildModelSchemaMap keys: ${mapKeys.join(', ')}`
        );
        assert.ok(
            mapKeys.some(key => key.toLowerCase() === 'prop'),
            `expected prop in buildModelSchemaMap keys: ${mapKeys.join(', ')}`
        );
    });
});
