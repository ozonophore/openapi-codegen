import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { Parser as ParserV2 } from '../api/v2/Parser';
import { Parser as ParserV3 } from '../api/v3/Parser';
import { createResolvedContext } from '../createResolvedContext';
import { buildModelSchemaMap } from '../reuseStore/reuseHelpers';
import { getOutputPaths } from '../utils/getOutputPaths';

const generatedRoot = path.join(__dirname, '../../../test/generated');

const OAS3_SPEC = `openapi: "3.0.0"
info:
  title: Schema registry
  version: "1.0.0"
paths:
  /error:
    get:
      parameters:
        - $ref: "#/components/parameters/ErrorResponse"
      responses:
        "200":
          description: ok
          headers:
            X-Err:
              $ref: "#/components/headers/ErrorResponse"
        "400":
          $ref: "#/components/responses/ErrorResponse"
        "418":
          $ref: "#/components/responses/InlineError"
    post:
      requestBody:
        $ref: "#/components/requestBodies/ErrorResponse"
      responses:
        "200":
          description: ok
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
            $ref: "#/components/schemas/ErrorResponse"
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
      in: query
      name: q
      schema:
        type: string
  headers:
    ErrorResponse:
      schema:
        type: string
  requestBodies:
    ErrorResponse:
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
`;

const OAS2_SPEC = `swagger: "2.0"
info:
  title: Schema registry
  version: "1.0.0"
paths:
  /error:
    get:
      parameters:
        - $ref: "#/parameters/ErrorResponse"
      responses:
        400:
          $ref: "#/responses/ErrorResponse"
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
      $ref: "#/definitions/ErrorResponse"
parameters:
  ErrorResponse:
    in: query
    name: q
    type: string
`;

describe('@unit: schema registry Models', () => {
    let tmpDir = '';

    afterEach(() => {
        if (tmpDir) {
            rmSync(tmpDir, { recursive: true, force: true });
            tmpDir = '';
        }
    });

    function writeSpec(name: string, contents: string): string {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'schema-registry-'));
        const specPath = path.join(tmpDir, name);
        writeFileSync(specPath, contents, 'utf8');
        return specPath;
    }

    test('OAS3 getModels emits one IErrorResponse and ignores response/parameter/header/requestBody', async () => {
        const specPath = writeSpec('v3.yaml', OAS3_SPEC);
        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const responseRef = context.getAllCanonicalRefs().find(ref => ref.includes('#/components/responses/ErrorResponse'));
        assert.ok(responseRef, 'getAllCanonicalRefs must still list non-Model Canonical Refs');
        const responseObject = context.get(responseRef) as { description?: string };
        assert.equal(responseObject.description, 'Error');
        assert.equal(context.exists(responseRef), true);

        const models = new ParserV3(context).getModels(openApi as never);
        const names = models.map(model => model.name);
        assert.deepEqual(
            names.filter(name => name === 'IErrorResponse' || name === 'ErrorResponse'),
            ['IErrorResponse']
        );
        assert.equal(names.filter(name => name === 'IErrorResponse').length, 1);
        assert.ok(!names.includes('ErrorResponse'));
        assert.ok(!names.includes('TErrorResponse'));
        assert.ok(!names.includes('InlineError'));
        assert.ok(!names.includes('IInlineError'));
    });

    test('OAS2 getModels keeps definitions ErrorResponse and drops responses/parameters', async () => {
        const specPath = writeSpec('v2.yaml', OAS2_SPEC);
        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const models = new ParserV2(context).getModels(openApi as never);
        const names = models.map(model => model.name);
        assert.ok(names.includes('IErrorResponse'));
        assert.equal(names.filter(name => name === 'IErrorResponse' || name === 'ErrorResponse').length, 1);
        assert.ok(!names.includes('ErrorResponse'));
        assert.ok(!names.includes('TErrorResponse'));
    });

    test('buildModelSchemaMap keys ErrorResponse to the Schema Object', async () => {
        const specPath = writeSpec('v3-map.yaml', OAS3_SPEC);
        const { context } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const schemaMap = buildModelSchemaMap(context);
        const errorResponse = schemaMap.get('ErrorResponse');
        assert.ok(errorResponse);
        assert.equal(errorResponse.type, 'object');
        assert.ok(errorResponse.properties);
        assert.equal((errorResponse as { description?: string }).description, undefined);
    });
});
