## Purpose

Correct artifact fingerprints: full schema-hash field whitelist, cycle-safe `$ref`
normalization, order-independent `required`/`enum`, and plugin config in options slice hash.

## Requirements

### Requirement: SCHEMA_HASH_KEYS содержит полный набор семантически значимых полей
`ArtifactFingerprinter` ДОЛЖЕН включать в schema hash следующие поля помимо уже имеющихся:
`minimum`, `maximum`, `pattern`, `const`, `default`, `discriminator`, `minLength`,
`maxLength`, `minItems`, `maxItems`, `exclusiveMinimum`, `exclusiveMaximum`.
Две схемы с разными constraint-полями ДОЛЖНЫ получать разные hash-значения.

#### Scenario: схемы с разными numeric constraints получают разные hash
- **WHEN** схема A: `{ type: 'string' }` vs схема B: `{ type: 'string', minLength: 1 }`
- **THEN** `hashSchema(A) !== hashSchema(B)`

#### Scenario: схемы с одинаковыми constraints получают одинаковый hash
- **WHEN** две идентичные схемы `{ type: 'integer', minimum: 0, maximum: 100 }`
- **THEN** их hash-значения равны

---

### Requirement: normalizeSchemaNode защищён от циклических $ref
`ArtifactFingerprinter.normalizeSchemaNode` ДОЛЖЕН отслеживать посещённые объекты схемы.
При обнаружении цикла — вставлять placeholder (`{ '$ref': '[Circular]' }`) вместо
бесконечной рекурсии.

#### Scenario: циклическая схема не вызывает stack overflow
- **WHEN** схема содержит циклическую `$ref` (A → B → A)
- **THEN** `hashSchema()` завершается без исключения и возвращает хеш

#### Scenario: циклический placeholder стабилен
- **WHEN** одна и та же циклическая схема хешируется дважды
- **THEN** оба вызова возвращают одинаковый hash

---

### Requirement: массивы required и enum сортируются перед хешированием
При вычислении schema hash значения полей `required` и `enum` (массивы строк)
ДОЛЖНЫ сортироваться в алфавитном порядке перед включением в `stableStringify`.
Порядок объявления полей в схеме НЕ ДОЛЖЕН влиять на hash.

#### Scenario: required с разным порядком даёт одинаковый hash
- **WHEN** схема A: `{ required: ['a', 'b'] }` vs схема B: `{ required: ['b', 'a'] }`
- **THEN** `hashSchema(A) === hashSchema(B)`

#### Scenario: enum с разным порядком даёт одинаковый hash
- **WHEN** схема A: `{ enum: ['x', 'y', 'z'] }` vs схема B: `{ enum: ['z', 'x', 'y'] }`
- **THEN** `hashSchema(A) === hashSchema(B)`

---

### Requirement: optionsSlice включает конфигурацию плагинов
`buildOptionsSlice` ДОЛЖЕН включать сериализованную конфигурацию каждого плагина
(не только имя). Изменение конфигурации плагина ДОЛЖНО приводить к смене `optionsSliceHash`.

#### Scenario: изменение конфигурации плагина инвалидирует hash
- **WHEN** плагин `my-plugin` изменяет опцию с `{ mode: 'a' }` на `{ mode: 'b' }`
- **THEN** `buildOptionsSlice` возвращает другой hash для нового конфига

#### Scenario: одинаковый конфиг плагина даёт одинаковый hash
- **WHEN** два конфига с идентичным плагином и его настройками
- **THEN** `buildOptionsSlice` возвращает одинаковый hash
