## Context

`resolvePluginEntries(openapiConfig, cliPlugins)` unions root `plugins` with **every** `items[].plugins`. `analyze-diff` already has `--input` (`analyzeDiff.ts` line 58) and does not pass it. A spec-specific hook from item B runs when analyzing item A.

Grill (2026-09-13): desired contract Active item (not a random broken if). Should-fix, not a stable-layer Defect. Match Active item by absolute `--input`. Glossary already defines **Active item**. Product copy is the sibling Upgrade page.

## Goals / Non-Goals

**Goals:**

- Plugin entries = root + Active item + CLI (`--plugins` strings).
- Absolute-path match on `item.input` vs `--input`.
- No match → root + CLI. Several matches → merge those items’ plugins and warn.
- Keep object `config` on entries (`configure` parity).

**Non-Goals:**

- Object-shaped CLI `--plugins`.
- Matching on `--compare-with` or git ref.
- Changing generate’s per-item plugin load.
- Docs beyond what tests/comments need (product copy is sibling).

## Decisions

1. **Absolute path equality, not basename.** `--input ./a.yaml` and `items[].input` may differ by cwd. Both sides `resolveHelper` (or equivalent absolute) before compare. Basename-only would collide on `api.yaml` in two folders.

   Alternative: string equality as written — rejected; relative vs absolute miss is the usual bug.

2. **Signature: `resolvePluginEntries(openapiConfig, cliPlugins, activeInput?)`.** `analyze-diff` passes absolute `--input`. Omitted `activeInput` (tests that only check root+CLI) behaves as no Active item: root + CLI.

   Alternative: always require input — rejected; current unit tests call without a spec path.

3. **Duplicate inputs: merge + warn.** Two items with the same absolute input are a config smell; dropping one silently would hide a plugin. Warn once, merge with existing path-dedupe.

4. **Git / compare-with ignored.** Active item is “which new spec is under analysis,” not the base.

## Risks / Trade-offs

- **[Risk] Config `input` is a URL or different spelling of the same file** → miss → root+CLI only (safe subset). Same intern/spelling rules as disk paths; no fuzzy repair.
- **[Risk] Existing test `collects plugins from items` expects the union** → replace with Active item cases; that test encodes the Defect.
- **[Trade-off] Miss is silent except “no item plugins”** → acceptable; warn only on multi-match.

## Migration Plan

Behavior change for multi-item configs that relied on the union. No schema bump. Rollback: restore union.

## Open Questions

_(none — Q16=A)_
