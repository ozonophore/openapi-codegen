## Purpose

Загрузка generator plugins и semantic diff hooks.

**Related:** `artifact-fingerprint-correctness` (plugin config in cache hash).

## Requirements

### Requirement: Plugin export shape validation
Каждый plugin module MUST export object с string field `name`; иначе load MUST throw invalid plugin error.

#### Scenario: Invalid export
- **WHEN** plugin file exports function without name
- **THEN** error "expected export with shape { name: string }"

---

### Requirement: Export resolution order
Plugin loader MUST resolve export as default, then named `plugin`, then module itself.

#### Scenario: Default export
- **WHEN** module has `export default { name: "my-plugin" }`
- **THEN** plugin loaded successfully

---

### Requirement: ESM fallback loading
CommonJS require MUST be attempted first; при ESM-related errors MUST fallback to dynamic import.

#### Scenario: ESM-only plugin
- **WHEN** require throws ERR_REQUIRE_ESM
- **THEN** plugin loaded via dynamic import

---

### Requirement: Builtin plugins appended
После user plugins MUST append builtin plugins как fallback handlers.

#### Scenario: No user plugins
- **WHEN** plugins array empty
- **THEN** only builtin plugins active (e.g. x-typescript-type override)

---

### Requirement: Semantic diff plugin hooks
Plugins MAY modify semantic diff report via hooks; hook diagnostics MUST log через analyze-diff diagnostic callback.

#### Scenario: Plugin modifies report
- **WHEN** plugin hook returns modified report
- **THEN** downstream ignore rules и miracles use modified report

---

### Requirement: Plugin paths from config in analyze-diff
analyze-diff MUST resolve plugin paths from openapi config when not passed explicitly on CLI.

#### Scenario: Config-defined plugins
- **WHEN** openapi.config.json lists plugins and analyze-diff runs
- **THEN** same plugins loaded for semantic diff hooks
