## Why

2.1.0 cannot ship while entry docs still sell «Plugin API v2 (RFC)» and `MIGRATION.md` still describes 1.0.0 → 2.1.0. That is the docs Defect of the stable layer. Contract changes and Known limitations must live on one Upgrade page so an upgrade from 2.0.0 does not look like a silent generate bug.

## What Changes

- Rewrite **Upgrade page** (`MIGRATION.md` and `MIGRATION.RU.md`) as **2.0.0 → 2.1.0** (one-line pointer to 1.0.0). Changelog stays a timeline, not a second list.
- List every Contract change from the grill, with the depth the grill required (`cachePath` exception, three executor migration paths, three fingerprint-miss waves, canary = `newClientWeight` / `headerValues.new` only).
- Name Known limitations, including object-shaped CLI `--plugins` (strings only), Model path collapse (leading `../` stripped), and analyze-diff plugin union until sibling `analyze-diff-active-item-plugins` lands.
- Remove «Plugin API v2 (RFC)» as the *current* contract from `docs/en|ru/{usage,features,configuration}.md`, README, `README.rus.md`, and See also in `plugins.md`. Point at factory + «v1/v2 files stay valid». Hidden redirect of the old anchor MAY remain without “RFC” in the heading.
- Add a real factory example under `example/plugins/` (`meta` + `createPlugin`, as in `plugins.md`). Object v1 example may stay.
- Document `--check` as an ERROR gate including consumer TypeScript. Remove `--check` from the required Unified CI example; optional step with that caveat is allowed.
- Mark Marauder Preview. Do not show 80/20. Canary copy uses `newClientWeight` / `headerValues.new` only (schema delete is `remove-old-canary-fields`).
- Fix leftover lies: changelog must not claim a public export of `normalizePathsToAbsolute()`; drop or replace the broken `request-executor-migration.md` link; `features.md` must say the custom executor is copied at generate time; `--cachePath` help must say reuse is resolved from cwd; splitter help is Preview (old-weight flag removal is the canary sibling).
- Land this docs change in the **same release window** as `history-bound-no-entity-skip` and `remove-old-canary-fields`. Do not merge a page that already claims those code results if the siblings are not in that release.
- Do **not** implement wrap, History-bound skip, Active item, or canary schema delete here. Do **not** restore Context aliases. Do **not** hash Diff report bodies. Do **not** implement 80/20.

## Capabilities

### New Capabilities

- `release-210-docs`: Upgrade page, Known limitations, Preview label, `--check` wording and CI example, leftover changelog/help fixes.

### Modified Capabilities

- `plugin-docs-restore`: drop `#plugin-api-v2-rfc` as the canonical features anchor; factory API is the author contract; factory example required; ru README and `plugins.md` See also included.

## Impact

- `MIGRATION.md`, `MIGRATION.RU.md`
- `CHANGELOG.md` / `CHANGELOG.RU.md` (pointer + false public-export line, not a second source of truth)
- `docs/en|ru/{usage,features,configuration,plugins,examples}.md`, README, `README.rus.md`
- `example/plugins/` factory sample
- CLI help strings for `--cachePath` and `--traffic-splitter` (Preview wording; old-weight flag is sibling)
- Sibling code owners: `history-bound-no-entity-skip` (stable-layer Defect), `analyze-diff-active-item-plugins` (Should-fix), `remove-old-canary-fields` (Should-fix), existing `plugin-legacy-wrap` (archive separately)
