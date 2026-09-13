## Why

Traffic Splitter schema accepts `oldClientWeight` and `headerValues.old`, but runtime only reads `newClientWeight` and `headerValues.new`. Dead fields lie about a 50/50 or “old header” contract. Preview canary config should name only the fields that work.

## What Changes

- **BREAKING** (preview config): remove `oldClientWeight` from the Traffic Splitter schema, types, emit, examples, and CLI dot-notation.
- **BREAKING** (preview config): `headerValues` is `{ new: string }` only — `old` is rejected.
- Routing stays `newClientWeight` (0–100) and `headerValues.new`. No live-traffic work.
- Product copy for Canary weight / header value is in sibling `document-210-release-contract`.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `canary-traffic-splitter`: header-based scenario no longer requires `headerValues.old`; weight is `newClientWeight` only.
- `generate-cli-marauder-flags`: drop `oldClientWeight` from `--traffic-splitter` dot-notation.
- `example-marauder-config`: example object drops `oldClientWeight`; `headerValues` if present is `{ new }` only.

## Impact

- `src/common/VersionedSchema/CommonSchemas.ts`
- `src/core/migration/types.ts`, `TrafficSplitter.ts`, `generateTrafficSplitterModule.ts`
- CLI marauder flag surface / tests that mention `oldClientWeight` or `headerValues.old`
- `example/openapi.marauder.config.json`
- Glossary: **Canary weight**, **Canary header value**
