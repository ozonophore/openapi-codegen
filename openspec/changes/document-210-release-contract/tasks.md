## 1. Upgrade page

- [x] 1.1 Retitle `MIGRATION.md` and `MIGRATION.RU.md` as 2.0.0 → 2.1.0; one-line pointer for 1.0.0
- [x] 1.2 Write Contract change list at grill depth: DiffReport 2.0; Schema Model / `SimpleRequestBody`; Context replacements + `cachePath` exception; factory / reject flat `'3'` / runtime `'3'`; eslint/prettier flags; report paths; `--cache` without strategy; executor (three paths + slim `ApiError.request`); fingerprint miss waves 185 / 191 / 193; canary = `newClientWeight` / `headerValues.new` only
- [x] 1.3 Write Known limitations: `2XX`→`200`; media-type fallback; existence-only skip when `useHistory` is off; last-write-wins; Model path collapse (`../` strip); usage JSON without `schemaVersion`; Marauder Preview / swarm stub; CLI `--plugins` strings only; analyze-diff union until Active item sibling, then Active item

## 2. Plugin entry

- [x] 2.1 Remove «Plugin API v2 (RFC)» as current from `docs/en|ru/{usage,features,configuration}.md`, README, `README.rus.md`, and See also in `docs/en|ru/plugins.md`
- [x] 2.2 Point those pages at factory API + «v1/v2 files stay valid» (`plugins.md`). Hidden old-hash heading allowed only without the word RFC
- [x] 2.3 Add factory example under `example/plugins/` matching `plugins.md` (`meta` + `createPlugin`, not a stub). Keep the v1 object example

## 3. Usage, CI example, Preview

- [x] 3.1 Document `analyze-usage --check` as ERROR-only including consumer TS; UNUSED is warning
- [x] 3.2 Remove `--check` from the required Unified CI snippet in `docs/en|ru/examples.md`; optional extra step may keep `--check` with the same caveat
- [x] 3.3 Mark workspace / splitter / swarm as Preview; canary copy uses `newClientWeight` / `headerValues.new` only; no 80/20 as a working split

## 4. Leftover lies

- [x] 4.1 Changelog EN/RU: do not claim public export of `normalizePathsToAbsolute()`
- [x] 4.2 Drop or replace broken `request-executor-migration.md` links; executor migration lives on the Upgrade page
- [x] 4.3 `features.md` EN/RU: custom executor is copied at generate time, not imported at runtime
- [x] 4.4 CLI help `--cachePath`: reuse-store path is from cwd
- [x] 4.5 CLI help `--traffic-splitter`: Preview (old-weight flag removal stays `remove-old-canary-fields`)

## 5. Same-window siblings

- [x] 5.1 Do not merge Upgrade page claims that History-bound items are never skipped, or that `oldClientWeight` is rejected, unless `history-bound-no-entity-skip` and `remove-old-canary-fields` are in the same release window

## 6. Check

- [x] 6.1 Grep: no primary `#plugin-api-v2-rfc` / «Plugin API v2 (RFC)» as current contract (en + ru)
- [x] 6.2 `openspec validate document-210-release-contract`
