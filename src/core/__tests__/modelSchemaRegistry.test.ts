import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { Parser as ParserV2 } from '../api/v2/Parser';
import { Parser as ParserV3 } from '../api/v3/Parser';
import type { OpenApi as OpenApiV2 } from '../api/v2/types/OpenApi.model';
import type { OpenApi as OpenApiV3 } from '../api/v3/types/OpenApi.model';
import { createResolvedContext } from '../createResolvedContext';
import { buildModelSchemaMap } from '../reuseStore/reuseHelpers';
import { getOutputPaths } from '../utils/getOutputPaths';

const generatedRoot = path.join(__dirname, '../../../test/generated');

const OAS3_DUPLICATE_NAME_SPEC = `openapi: "3.0.0"
info:
  title: Duplicate names
  version: "1.0.0"
paths:
  /fail:
    get:
      parameters:
        - $ref: '#/components/parameters/ErrorResponse'
      responses:
        '200':
          description: ok
          headers:
            X-Error:
              $ref: '#/components/headers/ErrorResponse'
          content:
            application/json:
              schema:
                type: string
        '500':
          $ref: '#/components/responses/ErrorResponse'
    post:
      requestBody:
        $ref: '#/components/requestBodies/ErrorResponse'
      responses:
        '200':
          description: ok
  /simple:
    post:
      requestBody:
        $ref: '#/components/requestBodies/SimpleRequestBody'
      responses:
        '200':
          description: ok
  /inline:
    get:
      responses:
        '400':
          $ref: '#/components/responses/InlineError'
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
    InlineError:
      description: Inline
      content:
        application/json:
          schema:
            type: object
            properties:
              code:
                type: integer
  parameters:
    ErrorResponse:
      name: error
      in: query
      schema:
        $ref: '#/components/schemas/ErrorResponse'
  headers:
    ErrorResponse:
      schema:
        type: string
  requestBodies:
    ErrorResponse:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    SimpleRequestBody:
      description: A reusable request body
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
`;

const OAS2_SPEC = `swagger: "2.0"
info:
  title: Duplicate names
  version: "1.0.0"
paths:
  /fail:
    get:
      parameters:
        - $ref: '#/parameters/ErrorResponse'
      responses:
        500:
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
parameters:
  ErrorResponse:
    name: error
    in: query
    type: string
`;

describe('@unit: Model Schema registry identity', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    test('OAS3: schema+response+parameter+header+requestBody with the same name yield one IErrorResponse Model', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'model-registry-v3-'));
        const specPath = path.join(tmpDir, 'api.yaml');
        writeFileSync(specPath, OAS3_DUPLICATE_NAME_SPEC, 'utf8');

        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const models = new ParserV3(context).getModels(openApi as OpenApiV3);
        const names = models.map(model => model.name);

        assert.equal(names.filter(name => name === 'IErrorResponse').length, 1);
        assert.equal(names.filter(name => name === 'ErrorResponse').length, 0);
        assert.equal(names.filter(name => name === 'TErrorResponse').length, 0);
        assert.ok(!names.includes('SimpleRequestBody'));
        assert.ok(!names.includes('ISimpleRequestBody'));
        assert.ok(!names.includes('InlineError'));
        assert.ok(!names.includes('IInlineError'));

        const responseRef = context.getAllCanonicalRefs().find(ref => ref.includes('#/components/responses/ErrorResponse'));
        assert.ok(responseRef);
        assert.equal(context.exists('#/components/responses/ErrorResponse', specPath), true);
        const responseObject = context.get('#/components/responses/ErrorResponse', specPath) as { description?: string; content?: unknown };
        assert.ok(responseObject?.description || responseObject?.content);

        const schemaMap = buildModelSchemaMap(context);
        const mapped = schemaMap.get('ErrorResponse');
        assert.ok(mapped);
        assert.equal(mapped.type, 'object');
        assert.ok(!('content' in mapped));
        assert.ok(!('in' in mapped));
        assert.equal(schemaMap.has('SimpleRequestBody'), false);
    });

    test('OAS2: #/definitions/ErrorResponse is a Model; #/responses/ and #/parameters/ are not', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'model-registry-v2-'));
        const specPath = path.join(tmpDir, 'api.yaml');
        writeFileSync(specPath, OAS2_SPEC, 'utf8');

        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const models = new ParserV2(context).getModels(openApi as OpenApiV2);
        const names = models.map(model => model.name);

        assert.equal(names.filter(name => name === 'IErrorResponse').length, 1);
        assert.equal(names.filter(name => name === 'ErrorResponse').length, 0);

        const schemaMap = buildModelSchemaMap(context);
        const mapped = schemaMap.get('ErrorResponse');
        assert.ok(mapped);
        assert.equal(mapped.type, 'object');
        assert.ok('properties' in mapped);
    });

    test('v3.withDifferentRefs.yml still yields INested and TProp and skips SimpleRequestBody', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'model-registry-refs-'));
        const specPath = path.join(__dirname, '../../../test/spec/v3.withDifferentRefs.yml');

        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const models = new ParserV3(context).getModels(openApi as OpenApiV3);
        const names = models.map(model => model.name);

        assert.ok(names.includes('INested'), `missing INested in ${names.join(', ')}`);
        assert.ok(names.includes('TProp'), `missing TProp in ${names.join(', ')}`);
        assert.ok(!names.includes('SimpleRequestBody'));

        const schemaMap = buildModelSchemaMap(context);
        const nested = schemaMap.get('nested');
        assert.ok(nested);
        assert.equal(nested.type, 'object');
        assert.ok(nested.properties && typeof nested.properties === 'object' && 'value' in nested.properties);
        assert.ok(!('content' in nested));

        const prop = schemaMap.get('prop');
        assert.ok(prop);
        assert.equal(prop.type, 'array');
        assert.ok(!('content' in prop));
    });
});
