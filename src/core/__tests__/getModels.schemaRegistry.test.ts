import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { Parser as ParserV2 } from '../api/v2/Parser';
import { Parser as ParserV3 } from '../api/v3/Parser';
import { createResolvedContext } from '../createResolvedContext';
import { buildModelSchemaMap } from '../reuseStore/reuseHelpers';
import type { Model } from '../types/shared/Model.model';
import { getOutputPaths } from '../utils/getOutputPaths';

const generatedRoot = path.join(__dirname, '../../../test/generated');

const OAS3_FIXTURE = `openapi: "3.0.0"
info:
  title: Duplicate Models
  version: "1.0.0"
paths:
  /error:
    post:
      parameters:
        - $ref: '#/components/parameters/ErrorResponse'
      requestBody:
        $ref: '#/components/requestBodies/ErrorResponse'
      callbacks:
        onError:
          $ref: '#/components/callbacks/ErrorResponse'
      responses:
        '200':
          description: ok
          headers:
            X-Err:
              $ref: '#/components/headers/ErrorResponse'
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                sample:
                  $ref: '#/components/examples/ErrorResponse'
          links:
            next:
              $ref: '#/components/links/ErrorResponse'
        '400':
          $ref: '#/components/responses/ErrorResponse'
        '500':
          $ref: '#/components/responses/InlineOnly'
components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        message:
          type: string
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
  responses:
    ErrorResponse:
      description: Error
      headers:
        X-Err:
          $ref: '#/components/headers/ErrorResponse'
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    InlineOnly:
      description: Inline schema inside a Response Object
      content:
        application/json:
          schema:
            type: object
            properties:
              detail:
                type: string
  examples:
    ErrorResponse:
      value:
        message: oops
  securitySchemes:
    ErrorResponse:
      type: apiKey
      in: header
      name: X-API-Key
    ErrorResponseAlias:
      $ref: '#/components/securitySchemes/ErrorResponse'
  links:
    ErrorResponse:
      operationId: unused
  callbacks:
    ErrorResponse:
      '{$request.body#/url}':
        post:
          responses:
            '200':
              description: ok
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

const OAS2_FIXTURE = `swagger: "2.0"
info:
  title: Duplicate Models
  version: "1.0.0"
paths:
  /error:
    get:
      parameters:
        - $ref: '#/parameters/ErrorResponse'
      x-securityDefinition:
        $ref: '#/securityDefinitions/ErrorResponse'
      responses:
        400:
          $ref: '#/responses/ErrorResponse'
definitions:
  ErrorResponse:
    type: object
    properties:
      message:
        type: string
parameters:
  ErrorResponse:
    name: ErrorResponse
    in: header
    type: string
responses:
  ErrorResponse:
    description: Error
    schema:
      $ref: '#/definitions/ErrorResponse'
securityDefinitions:
  ErrorResponse:
    type: apiKey
    name: X-API-Key
    in: header
`;

const OAS3_NON_MODEL_POINTERS = [
    '#/components/responses/ErrorResponse',
    '#/components/parameters/ErrorResponse',
    '#/components/headers/ErrorResponse',
    '#/components/requestBodies/ErrorResponse',
    '#/components/examples/ErrorResponse',
    '#/components/securitySchemes/ErrorResponse',
    '#/components/links/ErrorResponse',
    '#/components/callbacks/ErrorResponse',
] as const;

function modelNames(models: Model[]): string[] {
    return models.map(model => model.name).sort();
}

describe('@unit: getModels Schema registry', () => {
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

    test('OAS3: schema + same-named non-schema registries yield one IErrorResponse', async () => {
        const specPath = await writeSpec(OAS3_FIXTURE, 'api.yaml');

        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const canonicalRefs = context.getAllCanonicalRefs();
        for (const pointer of OAS3_NON_MODEL_POINTERS) {
            assert.ok(
                canonicalRefs.some(ref => ref.includes(pointer)),
                `getAllCanonicalRefs must still include ${pointer}`
            );
        }
        assert.equal(context.exists('#/components/responses/ErrorResponse', specPath), true);

        const models = new ParserV3(context).getModels(openApi as never);
        const names = modelNames(models);

        assert.deepEqual(names, ['IErrorResponse']);
        assert.ok(!names.includes('ErrorResponse'), `empty ErrorResponse must not be exported, got ${names.join(', ')}`);
        assert.ok(!names.includes('InlineOnly') && !names.includes('IInlineOnly'), `inline Response Object must not be a Model, got ${names.join(', ')}`);

        const schemaByName = buildModelSchemaMap(context);
        assert.equal(schemaByName.size, 1);
        const mapped = schemaByName.get('ErrorResponse');
        assert.ok(mapped);
        assert.equal(mapped.type, 'object');
        assert.ok(mapped.properties);
        assert.ok(!('content' in mapped));
    });

    test('OAS3 request-body-only spec does not export SimpleRequestBody', async () => {
        const specPath = await writeSpec(OAS3_REQUEST_BODY, 'request-body.yaml');
        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        assert.ok(context.getAllCanonicalRefs().some(ref => ref.includes('#/components/requestBodies/SimpleRequestBody')));

        const models = new ParserV3(context).getModels(openApi as never);
        assert.ok(!models.some(model => model.name === 'SimpleRequestBody' || model.name === 'ISimpleRequestBody'));
        assert.equal(buildModelSchemaMap(context).has('SimpleRequestBody'), false);
    });

    test('OAS3 inline-response-only spec does not export IErrorResponse', async () => {
        const specPath = await writeSpec(OAS3_INLINE_RESPONSE, 'inline.yaml');
        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const models = new ParserV3(context).getModels(openApi as never);
        assert.ok(!models.some(model => model.name === 'ErrorResponse' || model.name === 'IErrorResponse'));
    });

    test('v3.withDifferentRefs: #/properties refs stay Models; SimpleRequestBody does not', async () => {
        mkdirSync(generatedRoot, { recursive: true });
        tmpDir = mkdtempSync(path.join(generatedRoot, 'models-different-refs-'));
        const specPath = path.join(__dirname, '../../../test/spec/v3.withDifferentRefs.yml');

        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const canonicalRefs = context.getAllCanonicalRefs();
        assert.ok(
            canonicalRefs.some(ref => ref.includes('#/components/requestBodies/SimpleRequestBody')),
            'SimpleRequestBody Canonical Ref must still exist on Context'
        );
        assert.ok(
            canonicalRefs.some(ref => /#\/properties(\/|$)/.test(ref)),
            `expected a #/properties Pointer among Canonical Refs, got ${canonicalRefs
                .filter(ref => ref.includes('#'))
                .slice(0, 8)
                .join(', ')}`
        );

        const models = new ParserV3(context).getModels(openApi as never);
        const names = modelNames(models);

        assert.ok(names.includes('INested'), `expected INested from #/properties/…, got ${names.join(', ')}`);
        assert.ok(names.includes('TProp'), `expected TProp from #/properties/…, got ${names.join(', ')}`);
        assert.ok(!names.includes('SimpleRequestBody') && !names.includes('ISimpleRequestBody'), `Request Body Object must not be a Model, got ${names.join(', ')}`);
    });

    test('OAS2: #/definitions/ErrorResponse is a Model; responses/parameters/securityDefinitions are not', async () => {
        const specPath = await writeSpec(OAS2_FIXTURE, 'api.yaml');

        const { context, openApi } = await createResolvedContext({
            input: specPath,
            output: getOutputPaths({ output: path.join(tmpDir, 'out') }),
        });

        const canonicalRefs = context.getAllCanonicalRefs();
        assert.ok(canonicalRefs.some(ref => ref.includes('#/responses/ErrorResponse')));
        assert.ok(canonicalRefs.some(ref => ref.includes('#/definitions/ErrorResponse')));
        assert.ok(canonicalRefs.some(ref => ref.includes('#/securityDefinitions/ErrorResponse')));

        const models = new ParserV2(context).getModels(openApi as never);
        const names = modelNames(models);

        assert.deepEqual(names, ['IErrorResponse']);
        assert.ok(!names.includes('ErrorResponse'), `OAS2 Response Object must not be a Model, got ${names.join(', ')}`);
    });
});

describe('@unit: buildModelSchemaMap Schema registry', () => {
    test('key ErrorResponse maps to the Schema Object, not the Response Object', () => {
        const schemaObject = { type: 'object', properties: { message: { type: 'string' } } };
        const responseObject = {
            description: 'Error',
            content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
        };

        const map = buildModelSchemaMap({
            getAllCanonicalRefs: () => [
                '/tmp/api.yaml#/components/schemas/ErrorResponse',
                '/tmp/api.yaml#/components/responses/ErrorResponse',
                '/tmp/api.yaml#/components/parameters/ErrorResponse',
                '/tmp/api.yaml#/components/headers/ErrorResponse',
                '/tmp/api.yaml#/components/requestBodies/ErrorResponse',
                '/tmp/api.yaml#/components/examples/ErrorResponse',
                '/tmp/api.yaml#/components/securitySchemes/ErrorResponse',
                '/tmp/api.yaml#/components/links/ErrorResponse',
                '/tmp/api.yaml#/components/callbacks/ErrorResponse',
                '/tmp/api.yaml#/components/pathItems/ErrorResponse',
                '/tmp/api.yaml#/securityDefinitions/ErrorResponse',
            ],
            get: (ref: string) => {
                if (ref.includes('/schemas/')) {
                    return schemaObject;
                }
                return responseObject;
            },
        });

        assert.equal(map.get('ErrorResponse'), schemaObject);
        assert.notEqual(map.get('ErrorResponse'), responseObject);
        assert.equal(map.size, 1);
    });
});
