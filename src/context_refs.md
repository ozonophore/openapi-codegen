Содержимое this._refs из Context

```js
{
  _$refs: {
    "/Users/pidtchay/Developer/openapi-codegen/example/openapi/spec.yml": {
      errors: [
      ],
      $refs: [Circular],
      path: "/Users/pidtchay/Developer/openapi-codegen/example/openapi/spec.yml",
      pathType: "file",
      value: {
        openapi: "3.0.3",
        info: {
          title: "Document Management API",
          version: "1.0.0",
          description: "API for managing documents and accounts",
        },
        servers: [
          {
            url: "https://api.example.com/v1",
          },
        ],
        paths: {
          "/documents/account": {
            $ref: "./specs/account.yaml",
          },
          "/documents/list": {
            $ref: "./specs/list.yaml",
          },
          "/documents/{id}": {
            $ref: "./specs/document.yaml",
          },
          "/documents/search": {
            $ref: "./specs/search.yaml",
          },
        },
        components: {
          schemas: {
            ErrorResponse: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "ERR_INVALID_REQUEST",
                },
                message: {
                  type: "string",
                  example: "Invalid request parameters",
                },
              },
              required: [
                "code",
                "message",
              ],
            },
          },
        },
      },
    },
    "/Users/pidtchay/Developer/openapi-codegen/example/openapi/specs/account.yaml": {
      errors: [
      ],
      $refs: [Circular],
      path: "/Users/pidtchay/Developer/openapi-codegen/example/openapi/specs/account.yaml",
      pathType: "file",
      value: {
        get: {
          summary: "Get account details",
          operationId: "getAccount",
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AccountResponse",
                  },
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            AccountResponse: {
              type: "object",
              properties: {
                account: {
                  $ref: "#/components/schemas/Account",
                },
              },
              required: [
                "account",
              ],
            },
            Account: {
              allOf: [
                {
                  $ref: "#/components/schemas/BaseEntity",
                },
                {
                  type: "object",
                  properties: {
                    accountId: {
                      type: "string",
                      example: "acc_12345",
                    },
                    balance: {
                      type: "number",
                      format: "float",
                      example: 1000.5,
                    },
                  },
                  required: [
                    "accountId",
                    "balance",
                  ],
                },
              ],
            },
            BaseEntity: {
              type: "object",
              properties: {
                createdAt: {
                  type: "string",
                  format: "date-time",
                },
                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
              required: [
                "createdAt",
              ],
            },
          },
        },
      },
    },
    "/Users/pidtchay/Developer/openapi-codegen/example/openapi/specs/list.yaml": {
      errors: [
      ],
      $refs: [Circular],
      path: "/Users/pidtchay/Developer/openapi-codegen/example/openapi/specs/list.yaml",
      pathType: "file",
      value: {
        get: {
          summary: "List all documents",
          operationId: "listDocuments",
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DocumentListResponse",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            DocumentListResponse: {
              type: "object",
              properties: {
                documents: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Document",
                  },
                },
              },
              required: [
                "documents",
              ],
            },
            Document: {
              allOf: [
                {
                  $ref: "#/components/schemas/BaseEntity",
                },
                {
                  type: "object",
                  properties: {
                    documentId: {
                      type: "string",
                      example: "doc_67890",
                    },
                    title: {
                      type: "string",
                      example: "Contract",
                    },
                  },
                  required: [
                    "documentId",
                    "title",
                  ],
                },
              ],
            },
            BaseEntity: {
              type: "object",
              properties: {
                createdAt: {
                  type: "string",
                  format: "date-time",
                },
                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
              required: [
                "createdAt",
              ],
            },
          },
        },
      },
    },
    "/Users/pidtchay/Developer/openapi-codegen/example/openapi/specs/document.yaml": {
      errors: [
      ],
      $refs: [Circular],
      path: "/Users/pidtchay/Developer/openapi-codegen/example/openapi/specs/document.yaml",
      pathType: "file",
      value: {
        get: {
          summary: "Get document by ID",
          operationId: "getDocument",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DocumentResponse",
                  },
                },
              },
            },
            "404": {
              description: "Document not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            DocumentResponse: {
              type: "object",
              properties: {
                document: {
                  $ref: "#/components/schemas/Document",
                },
              },
              required: [
                "document",
              ],
            },
            Document: {
              allOf: [
                {
                  $ref: "#/components/schemas/BaseEntity",
                },
                {
                  type: "object",
                  properties: {
                    documentId: {
                      type: "string",
                      example: "doc_67890",
                    },
                    content: {
                      type: "string",
                      example: "Document content",
                    },
                  },
                  required: [
                    "documentId",
                    "content",
                  ],
                },
              ],
            },
            BaseEntity: {
              type: "object",
              properties: {
                createdAt: {
                  type: "string",
                  format: "date-time",
                },
                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
              required: [
                "createdAt",
              ],
            },
          },
        },
      },
    },
    "/Users/pidtchay/Developer/openapi-codegen/example/openapi/specs/search.yaml": {
      errors: [
      ],
      $refs: [Circular],
      path: "/Users/pidtchay/Developer/openapi-codegen/example/openapi/specs/search.yaml",
      pathType: "file",
      value: {
        get: {
          summary: "Search documents",
          operationId: "searchDocuments",
          parameters: [
            {
              name: "query",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SearchResponse",
                  },
                },
              },
            },
            "400": {
              description: "Invalid query",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "500": {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            SearchResponse: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/DocumentSummary",
                  },
                },
              },
              required: [
                "results",
              ],
            },
            DocumentSummary: {
              allOf: [
                {
                  $ref: "#/components/schemas/BaseEntity",
                },
                {
                  type: "object",
                  properties: {
                    documentId: {
                      type: "string",
                      example: "doc_67890",
                    },
                    title: {
                      type: "string",
                      example: "Contract",
                    },
                    snippet: {
                      type: "string",
                      example: "Short preview...",
                    },
                  },
                  required: [
                    "documentId",
                    "title",
                  ],
                },
              ],
            },
            BaseEntity: {
              type: "object",
              properties: {
                createdAt: {
                  type: "string",
                  format: "date-time",
                },
                updatedAt: {
                  type: "string",
                  format: "date-time",
                },
              },
              required: [
                "createdAt",
              ],
            },
          },
        },
      },
    },
  },
  toJSON: function(...types) {
    const $refs = this._$refs;
    const paths = getPaths($refs, types.flat());
    return paths.reduce((obj, path) => {
        obj[(0, convert_path_to_posix_1.default)(path.decoded)] = $refs[path.encoded].value;
        return obj;
    }, {});
  },
  circular: false,
  _root$Ref: {
    errors: [
    ],
    $refs: [Circular],
    path: "/Users/pidtchay/Developer/openapi-codegen/example/openapi/spec.yml",
    pathType: "file",
    value: {
      openapi: "3.0.3",
      info: {
        title: "Document Management API",
        version: "1.0.0",
        description: "API for managing documents and accounts",
      },
      servers: [
        {
          url: "https://api.example.com/v1",
        },
      ],
      paths: {
        "/documents/account": {
          $ref: "./specs/account.yaml",
        },
        "/documents/list": {
          $ref: "./specs/list.yaml",
        },
        "/documents/{id}": {
          $ref: "./specs/document.yaml",
        },
        "/documents/search": {
          $ref: "./specs/search.yaml",
        },
      },
      components: {
        schemas: {
          ErrorResponse: {
            type: "object",
            properties: {
              code: {
                type: "string",
                example: "ERR_INVALID_REQUEST",
              },
              message: {
                type: "string",
                example: "Invalid request parameters",
              },
            },
            required: [
              "code",
              "message",
            ],
          },
        },
      },
    },
  },
}
```