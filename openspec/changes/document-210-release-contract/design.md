## Context

Second grill (2026-09-13) sharpened the first: a **Defect** blocks 2.1.0 only when the *stable* layer lies (default generate, entry docs, `--useHistory`). **Should-fix** is cheap and right but does not hold the tag. This change is the docs Defect: entry pages still call the current contract «Plugin API v2 (RFC)», and there is no **Upgrade page** for 2.0.0 → 2.1.0.

`plugin-legacy-wrap` owns wrap implementation (done on HEAD; archive separately). This change only points readers at the current author contract.

Siblings: `history-bound-no-entity-skip` is the remaining *code* Defect of the stable layer. `analyze-diff-active-item-plugins` and `remove-old-canary-fields` are Should-fix.

## Goals / Non-Goals

**Goals:**

- One Upgrade page (`MIGRATION.md` + `MIGRATION.RU.md`) for 2.0.0 → 2.1.0 listing every Contract change at grill depth.
- Known limitations named so they are not treated as silent generate bugs.
- Stale RFC / v2-as-current links gone on every paired page including `README.rus.md` and `plugins.md` See also; factory example exists and matches `plugins.md`.
- `--check` wording is true; `--check` is not the required Unified CI gate.
- Marauder Preview; no 80/20 copy.
- Leftover changelog / help / dead-link lies fixed in this change.
- Docs that mention History-bound skip or deleted canary fields ship in the same window as those siblings.

**Non-Goals:**

- Implementing History-bound skip, Active item, or canary field delete.
- Restoring Context aliases (`resolveCanonicalRef`, `getVirtualFiles`).
- Hashing Diff report bodies; object CLI `--plugins`; live canary; implementing 80/20.
- Archiving `plugin-legacy-wrap`.
- Rewriting 1.0.0 history except a pointer.

## Decisions

1. **Upgrade page is the single upgrade list.** `MIGRATION.md` and `MIGRATION.RU.md`. Changelog stays a timeline. Contract changes (what to do, not a code dump):

   - DiffReport 2.0 (nested; confirmation in `structural.miracles`)
   - Schema Model denylist (empty `SimpleRequestBody` etc. gone — corrected 2.0.0 Defect, now Contract change)
   - Context: `resolveCanonicalRef` / `getVirtualFiles` removed; option paths become absolute internally; **`cachePath` is not in that normalization**
   - Plugin factory API; flat `{ apiVersion: '3' }` rejected; after load runtime `'3'` even for v1/v2
   - `useEslintFix` / `useProjectPrettier` → `prettierConfigPath` + `tsconfigPath` / `eslintConfigPath`
   - Default report paths → `.openapi-codegen-reports/`
   - `--cache` without strategy → reuse-store in cwd
   - Custom `request(RequestConfig, options)` / slim `ApiError.request` — three migration paths: rewrite to `request(ApiRequestOptions, OpenAPI)` + `requestRaw` (`createLegacyRequestAdapter` is the `createClient` default); `customExecutorPath`; `executorFactory` override
   - Entity/reuse fingerprint miss: three waves (PDTCH-185 MD5 + wider hash; 191 v3; 193 v4 + integrity) — one-time, not permanent
   - Traffic splitter: `newClientWeight` / `headerValues.new` only (after sibling delete)

2. **Known limitations (do not “fix” in 2.1.0):** Range status `2XX`→`200`; media-type fallback; Entity skip is existence-not-content when `useHistory` is off; shared output last-write-wins; Model path collapse (leading `../` stripped; name collision or skip); `analyze-usage` JSON has no `schemaVersion`; Marauder is Preview (not live traffic); swarm is a stub manifest; CLI `--plugins` is string paths only; analyze-diff loads the union of config plugins until sibling Active item lands — then document Active item, not union.

3. **`--check`:** Behavior stays (ERROR including consumer TS; UNUSED is WARNING). `usage.md` tells that truth. `examples.md` MUST NOT keep `--check` in the required Unified CI list; an optional extra step with the same caveat is allowed.

4. **Features anchor:** keep a short “v2 hooks” section if needed for hook names, but drop “RFC” and point to `plugins.md`. Hidden redirect of the old hash MAY remain **without** “RFC” in the heading. TOC / usage / configuration / both READMEs / `plugins.md` See also MUST NOT present RFC as current.

5. **Factory example** in `example/plugins/` is a real `meta` + `createPlugin` (or function + `.meta`) in the style of `plugins.md` (`onConfigure` / PluginApi as the canon shows). Not a stub. Existing v1 object example may remain.

6. **Language:** en + ru for every page that already exists in both, including `MIGRATION.RU.md` and `README.rus.md`.

7. **Same-window siblings.** Do not merge an Upgrade page that already states “History-bound items are never skipped” or “`oldClientWeight` is rejected” unless those siblings are in the same 2.1.0 window. Until then, describe HEAD honestly or wait.

8. **Leftover lies in this change:** changelog line that `normalizePathsToAbsolute()` is a public export — remove or correct; broken `request-executor-migration.md` link — replace with Upgrade page executor section; `features.md` custom executor is copied at generate, not imported at runtime; `--cachePath` help: reuse path is from cwd; `--traffic-splitter` help: Preview, not “canary migrations” as a production feature.

## Risks / Trade-offs

- **[Risk] Migration page duplicates changelog** → migration = “what to do”; changelog = “when it landed.”
- **[Risk] Sibling code not landed yet** → do not claim sibling results early (decision 7). Do not keep two permanent “HEAD vs 2.1.0” columns.
- **[Trade-off] `MIGRATION.md` title becomes 2.0.0 → 2.1.0** → 1.0.0 readers get a one-line pointer.

## Migration Plan

Docs-only (plus CLI help strings). No runtime rollback.

## Open Questions

_(none)_
