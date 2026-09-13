## 1. Helper

- [x] 1.1 Add `sourceFileAfterRef(canonicalRef, fallbackParent)` next to `toParentSourceFile` in `canonicalRef.ts`
- [x] 1.2 Unit tests: source file from Canonical Ref; empty source file → fallback; pointer-only Canonical Ref → fallback

## 2. Parsers

- [x] 2.1 v3 `getOperationParameters`: Follow after parameter `$ref` before `getOperationParameter`
- [x] 2.2 v2 `getOperationParameters`: same Follow
- [x] 2.3 v3 `getOperation` requestBody: Follow after requestBody `$ref` before `getOperationRequestBody`
- [x] 2.4 v3 and v2 `getOperationParameter`: inline schema `getModel` uses Follow parent, not `''`
- [x] 2.5 v2/v3 `getOperationResponses` and `getServices` call `sourceFileAfterRef` (same Follow)

## 3. Tests and changelog

- [x] 3.1 Fixture: operation file `$ref`s parameter and requestBody in another file; those objects use a relative file Tree `$ref` for schema
- [x] 3.2 Assert generated parameter and body types join from the component file (or Parser model types / imports prove Follow)
- [x] 3.3 CHANGELOG Fixed (Unreleased or current beta); no MIGRATION.md
- [x] 3.4 `openspec validate follow-after-ref`
