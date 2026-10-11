## Why

`$ref` lookup already joins a Tree `$ref` from the correct Parent source file, but operation parsers keep the caller’s file after `get` for parameters, requestBody, and inline parameter schemas. Nested Tree `$refs` then join from the operation file, so multi-file specs generate the wrong type or throw `RefLookupError`. Responses already Follow; that must be the operation-parse contract, not a one-off.

## What Changes

- After `$ref` lookup of a parameter, requestBody, or path item, nested Tree `$refs` MUST use Follow: Parent source file = source file of that Canonical Ref.
- Inline parameter schemas MUST keep the same Follow parent (not an empty parent).
- Named helper `sourceFileAfterRef` in `canonicalRef.ts` is the implementation of Follow; parsers call it after `toCanonicalRef`. Not a new package.
- Tests: multi-file parameter **and** requestBody with a nested relative Tree `$ref`.
- CHANGELOG bugfix only. No Upgrade page entry (not a 2.0.0 → 2.1.0 contract change).

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `canonical-ref-lookup`: add Follow — Parent source file for nested Tree `$refs` inside an object reached by `$ref` lookup.
- `openapi-spec-parsing`: operation parse MUST Follow after parameter / requestBody `$ref` and MUST NOT pass an empty parent into inline parameter schema parse.

## Impact

- `src/core/utils/canonicalRef.ts` (`sourceFileAfterRef`)
- v2/v3 `getOperationParameters`, v3 `getOperation` requestBody, v2/v3 `getOperationParameter` inline schema
- v2/v3 `getOperationResponses` and `getServices` switch to the helper (same Follow, no behavior change)
- Tests: helper unit + parser/generate fixture for cross-file parameter and requestBody
- `CONTEXT.md` Language: **Follow** (already added)
- CHANGELOG Fixed; no MIGRATION.md
