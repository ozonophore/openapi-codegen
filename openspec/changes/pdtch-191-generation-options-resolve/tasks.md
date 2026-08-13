## 1. Module

- [x] 1.1 `resolveGenerationOptions`: throw validate + flatten (six item overrides + HEAD miracles) + defaults; not exported from `src/core/index.ts`

## 2. Wire

- [x] 2.1 `OpenApiClient.generate(rawOptions)` calls resolve; delete private normalize/defaults
- [x] 2.2 Drop `validateRawOptions` from `core/index.ts`; delete the file

## 3. Tests / docs

- [x] 3.1 Unit: item overrides + inherit + throw on invalid
- [x] 3.2 CONTEXT.md + fingerprint comments
