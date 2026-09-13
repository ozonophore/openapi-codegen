## Why

Follow after `$ref` lookup is a three-step dance (`get` + `toCanonicalRef` + `sourceFileAfterRef`) copied into every operation parser. The helper named the math; parsers can still forget the dance. A Follow module hides lookup + rebind behind one interface so the next parser cannot inline a broken parent.

## What Changes

- New Follow module: `lookupAndFollow(lookup, node, parent) → { value, parent }`.
- Operation parsers (parameters, requestBody, responses, path `$ref`) MUST call it instead of inlining Follow.
- `sourceFileAfterRef` stays the Canonical Ref primitive inside `canonicalRef.ts`.
- ADR records why this module exists (helper-only vs Context method vs this seam).
- No behavior change. No Upgrade page.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `canonical-ref-lookup`: Follow after `$ref` lookup MUST go through `lookupAndFollow`; parsers MUST NOT reimplement get + Canonical Ref + `sourceFileAfterRef`.

## Impact

- `src/core/follow/lookupAndFollow.ts` + unit tests
- v2/v3 `getOperationParameters`, `getOperationResponses`, `getServices`; v3 `getOperation` requestBody
- `docs/adr/0004-follow-lookup-module.md`
- Existing multi-file Follow fixture stays the behavior test
