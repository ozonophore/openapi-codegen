## Context

`GenerationItemSession.run` decides skip via `resolveEntitySkip` (`itemRun/resolveEntitySkip.ts`) **before** `prepareClientFromOpenApi`. History apply lives only on the prepare path. Fingerprint v4 hashes spec content, `useHistory` (bool), and the Diff report *path* — not the report body. Confirm-then-regen with a warm cache never opens the report.

Grill: Q8 Defect, Q15=A (never skip a History-bound item). Sibling `document-210-release-contract` names existence-only skip as a Known limitation when `useHistory` is off.

## Goals / Non-Goals

**Goals:**

- `useHistory === true` ⇒ Entity skip is false. Generate always parses and applies the Diff report.
- One gate used by both `shouldEntitySkip` and `resolveEntitySkip` (session is the production caller).

**Non-Goals:**

- Hashing report body or mtime (rejected vs A).
- Changing fingerprint version or OptionsSlice.
- Changing `loadDiffReport` stale-mtime rules.
- Docs / changelog (sibling change).

## Decisions

1. **Deny skip, do not hash the report.** History-bound item is an input that must be read every run. Hashing the body would still skip when the file is unchanged; deny is simpler and matches “report is an input.”

   Alternative: include report content in fingerprint v5 — rejected (Q15). Extra I/O, version bump, still skips when the user expects apply.

2. **Gate on the item, inside `resolveEntitySkipCandidate`.** Pass `historyBound: item.useHistory === true`. Both `shouldEntitySkip` and `resolveEntitySkip` already call the candidate. Fixing only `shouldEntitySkip` would leave the session skip path broken.

   Alternative: check only in `GenerationItemSession.run` — rejected; skip policy belongs in EntitySkip, not the session.

3. **No fingerprint bump.** Ineligible items never compare fingerprints for skip. Cache set after a history run may still write an entry; the next history run ignores it.

## Risks / Trade-offs

- **[Risk] History-bound items always pay full generate** → accepted. Cache still helps items without `useHistory`.
- **[Risk] Call site forgets `historyBound`** → default `false` would reintroduce the Defect; require the flag or read it from `item` at both wrappers (tests that call candidate directly must pass it).
- **[Trade-off] Existence-only skip for non-history items stays** → Known limitation, not this change.

## Migration Plan

No config migration. Rollback: drop the `historyBound` deny.

## Open Questions

_(none — Q15=A)_
