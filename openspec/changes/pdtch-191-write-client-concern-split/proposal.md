## Why

`WriteClient` — shallow multi-concern Output session: artifact write, expected-file registry, lint targets, index combine и logger в одном классе. Item/batch sessions уже разведены; locality write/lint/index всё ещё смешана.

## What Changes

- Три internal modules: **OutputFileSession**, **LintTargetRegistry**, **IndexCombineSession**.
- `WriteClient` — thin facade: compose трёх modules, public surface = delegates; `writeClient()` orchestration и leaf `writeClient*` остаются на facade.
- Public names on HEAD preserved: `combineAndWrightSimple`, `isSameShema`. No modelsMode conflict guard (HEAD does not have it).
- Убрать unused `writeClient` ctor param у `SharedFolderWriter`.
- Session deps остаются `writeClient: WriteClient`.

**Out of scope:** leaf `this:` → adapter, CoreOutputAdapter, typo renames, modelsMode conflict guard, Diff/options.

## Capabilities

### New Capabilities

- `write-client-concern-split`: ownership split Output session (три modules + WriteClient facade)

### Modified Capabilities

_(none — runtime write/lint/combine requirements unchanged)_

## Impact

- New `OutputFileSession.ts`, `LintTargetRegistry.ts`, `IndexCombineSession.ts`
- Slim `WriteClient.ts`; `SharedFolderWriter` + call sites
- `CONTEXT.md`
- Нет **BREAKING** публичного API
