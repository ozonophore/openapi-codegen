## 1. Adapter

- [x] 1.1 `generateCliOptionsAdapter.ts` + `resolveGenerateCliToRawOptions`; move flat schema inward
- [x] 1.2 Thin `generateOpenApiClient`; remove old `generateCliOverrides.ts` (imports → adapter)
- [x] 1.3 Export OVERRIDE_KEYS; drift test; update overrides tests imports

## 2. Verify

- [x] 2.1 tsc + unit tests + knip + openspec validate
