## ADDED Requirements

### Requirement: Migration page is 2.0.0 to 2.1.0
`MIGRATION.md` and `MIGRATION.RU.md` MUST describe upgrade from **2.0.0** to **2.1.0**. They MUST list these Contract changes: DiffReport 2.0 shape; Schema Model denylist (no empty types from requestBodies / responses / parameters); removed Context `resolveCanonicalRef` / `getVirtualFiles`, absolute option paths, and that `cachePath` is not normalized with those paths; Plugin factory API and rejection of a flat `{ apiVersion: '3' }` object; runtime `apiVersion` `'3'` after load for v1/v2; replacement of `useEslintFix` / `useProjectPrettier`; default report directory `.openapi-codegen-reports/`; `--cache` without strategy writing a reuse-store in cwd; RequestExecutor / slim `ApiError.request` with the three migration paths (rewrite `request(ApiRequestOptions, OpenAPI)` + `requestRaw` — `createLegacyRequestAdapter` is the `createClient` default; `customExecutorPath`; `executorFactory` override); one-time entity/reuse cache miss from all three fingerprint waves (PDTCH-185, 191, 193); canary fields `newClientWeight` and `headerValues.new` only.

#### Scenario: Reader upgrading from 2.0.0 finds Schema Model
- **WHEN** a consumer looks up why `SimpleRequestBody` disappeared after regen
- **THEN** the Upgrade page states that only Schema Models are emitted and old empty registry types were a 2.0.0 Defect

#### Scenario: Title is not 1.0.0 as the primary baseline
- **WHEN** the English or Russian migration page heading is read
- **THEN** the primary baseline is 2.0.0 → 2.1.0

#### Scenario: cachePath is called out
- **WHEN** a reader looks up absolute option paths
- **THEN** the Upgrade page states that `cachePath` is not included in that normalization

---

### Requirement: Known limitations are named
The Upgrade page MUST name 2.1.0 Known limitations: Range status code `2XX` maps to `200`; unstable first media-type fallback; Entity skip checks file presence not content when `useHistory` is off; shared output last-write-wins; Model path collapse (leading `../` on a model output path is stripped — name collision or skip if still outside the models folder); `analyze-usage` report has no `schemaVersion`; Marauder workspace / splitter / swarm are Preview (not live traffic; swarm is a stub manifest); CLI `--plugins` accepts string paths only; analyze-diff loads the union of config plugins until Active item is implemented, then Active item (not union).

#### Scenario: 2XX is not presented as a bug
- **WHEN** a reader searches docs for `2XX`
- **THEN** the text says generation maps the range key to the first code (`200`) and that this is intended

#### Scenario: Model path collapse is named
- **WHEN** a reader looks up model output paths that leave the models folder
- **THEN** the Upgrade page states that leading `../` is stripped, that two source files can share one output path, and that a path still outside the folder is skipped

#### Scenario: object CLI plugins are a limitation
- **WHEN** a reader looks up `--plugins`
- **THEN** the Upgrade page or linked usage says the flag is string paths only and object `config` lives in the file

---

### Requirement: analyze-usage --check wording
Product docs for `analyze-usage` MUST state that `--check` exits non-zero when any finding has severity ERROR, including TypeScript diagnostics from the consumer project. WARNING-only findings MUST NOT fail `--check`. Docs MUST NOT call this a Defect. The required Unified CI example in `examples.md` (en and ru) MUST NOT include `--check`. An optional extra step MAY show `--check` with the same ERROR-gate caveat.

#### Scenario: --check documented as ERROR gate
- **WHEN** a reader opens analyze-usage usage docs
- **THEN** `--check` is described as an ERROR gate including consumer TypeScript, not as “API contract mismatches only”

#### Scenario: Unified CI example is not the --check gate
- **WHEN** a reader copies the required Unified CI snippet from `examples.md`
- **THEN** the snippet does not run `analyze-usage --check`

---

### Requirement: Marauder Preview label
Docs that list workspace report, Traffic Splitter, or Avatar swarm MUST label them Preview and MUST describe canary routing with `newClientWeight` and `headerValues.new` only. They MUST NOT present an 80/20 pair as a working split.

#### Scenario: Features do not list Marauder as default stable
- **WHEN** a reader scans the feature list for 2.1.0
- **THEN** those three blocks are marked Preview, not as required generate behavior

---

### Requirement: Leftover changelog and help lies
`CHANGELOG.md` / `CHANGELOG.RU.md` MUST NOT claim `normalizePathsToAbsolute()` is a public package export. Product docs MUST NOT link a missing `request-executor-migration.md`; the Upgrade page executor section is the migration text. `features.md` (en and ru) MUST state that a custom executor file is copied at generate time, not imported from the user path at runtime. CLI help for `--cachePath` MUST state that a reuse-store path is resolved from cwd. CLI help for `--traffic-splitter` MUST label the feature Preview and MUST NOT advertise production canary migrations.

#### Scenario: changelog does not invent a public normalize export
- **WHEN** a reader scans the 2.1.0-beta.16 changelog notes for Context / paths
- **THEN** there is no claim that `normalizePathsToAbsolute()` is exported from the package
