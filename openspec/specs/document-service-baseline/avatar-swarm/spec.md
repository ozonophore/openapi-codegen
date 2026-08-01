## Purpose

AvatarSwarm manifest для multi-avatar orchestration после generation run.

## Requirements

### Requirement: Swarm manifest after generation stats
Swarm manifest MUST строиться из completed items и specStats (reuse hits/misses per spec); MUST NOT блокировать main generation.

#### Scenario: Successful swarm
- **WHEN** swarm enabled после multi-spec run
- **THEN** manifest contains avatars array with specItem, input, output, reuseHits, reuseMisses per item

#### Scenario: Avatars per item
- **WHEN** config has 3 items
- **THEN** manifest.avatars has 3 elements with correct specItem, input, output

---

### Requirement: Shared models from reuse manifest
Shared models MUST включать artifacts с referencedBy.length > 1 when reuse store available. Без reuse store sharedModels MUST быть пустым массивом.

#### Scenario: Cross-spec shared model
- **WHEN** reuse store manifest has artifact referencedBy 2+ spec items
- **THEN** sharedModels entry with name, kind, usedBy, artifactKey

#### Scenario: No reuse store
- **WHEN** swarm enabled but cache/reuse not used
- **THEN** sharedModels array empty

---

### Requirement: Manifest version and timestamp
Swarm manifest MUST include version=1 and ISO generatedAt timestamp.

#### Scenario: Manifest structure
- **WHEN** swarm build completes
- **THEN** JSON contains version, generatedAt, avatars, sharedModels, operationIndex

---

### Requirement: Operation index by specItem namespace
operationIndex MUST map specItem names to themselves as namespace placeholders. Operations NOT parsed at swarm build time; operationIds in avatars remain empty arrays.

#### Scenario: Two specs
- **WHEN** items for pet.yaml and store.yaml
- **THEN** operationIndex keys include pet and store spec item names mapping to themselves

---

### Requirement: Configurable output path
Swarm output MUST respect swarm.output config path; default `./swarm-manifest.json`.

#### Scenario: Custom output
- **WHEN** swarm `{ output: "./reports/swarm.json" }`
- **THEN** manifest written to specified path as valid JSON

---

### Requirement: Generation failure is non-fatal
Swarm write exception MUST log warning and not fail main generation run.

#### Scenario: Write failure
- **WHEN** swarm output path not writable
- **THEN** warning "swarm: failed to generate manifest"
