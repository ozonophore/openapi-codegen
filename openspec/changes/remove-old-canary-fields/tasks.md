## 1. Schema and types

- [x] 1.1 Remove `oldClientWeight` from `trafficSplitterConfigSchema` and related types
- [x] 1.2 Change `headerValues` to `{ new: string }`; reject `old`
- [x] 1.3 Drop the fields from emit / `TrafficSplitter` module types if they still appear

## 2. CLI and example

- [x] 2.1 Remove `--traffic-splitter.oldClientWeight` (and `headerValues.old`) from CLI surface / tests
- [x] 2.2 Delete `oldClientWeight` from `example/openapi.marauder.config.json`

## 3. Tests and snapshots

- [x] 3.1 Schema tests: `oldClientWeight` / `headerValues.old` fail validation
- [x] 3.2 Header-based tests use `headerValues.new` only
- [x] 3.3 Update generated TrafficSplitter snapshots if they mention the removed fields

## 4. Check

- [x] 4.1 Related unit / snapshot suites pass
- [x] 4.2 `openspec validate remove-old-canary-fields`
