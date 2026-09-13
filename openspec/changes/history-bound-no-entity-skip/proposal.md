## Why

`--useHistory` обещает прочитать Diff report и применить его к клиенту. Entity skip смотрит только hash спеки и *путь* отчёта, не тело: после confirm в том же файле повторный generate молча пропускает item, и отчёт больше не открывается. Это Defect 2.1.0 — релиз без патча нельзя.

## What Changes

- History-bound item (`useHistory` on) never takes Entity skip. Full generate runs; Diff report is loaded and applied every time.
- Fingerprint shape stays v4. We do **not** hash report body or mtime.
- Docs for this skip exception live in the sibling change `document-210-release-contract` (Known limitation: existence-only skip still applies when `useHistory` is off).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `entity-skip-fingerprint`: History-bound item is ineligible for Entity skip even on fingerprint + files + reuse integrity hit.

## Impact

- `src/core/generationCache/EntitySkip.ts` (`shouldEntitySkip` / `resolveEntitySkipCandidate`)
- Generation item session already applies history only on the non-skip path — no session reorder
- Tests: EntitySkip + generate/`useHistory` warm-cache after report edit
- Glossary term already in `CONTEXT.md`: **History-bound item**
