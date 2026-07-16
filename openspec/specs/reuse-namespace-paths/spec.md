## Purpose

Namespaced ReuseStore artifact paths under `reuseOnConflict: "namespace"` must include
`schemaHash` so repeated conflicts for the same `specItem` and `optionsSliceHash` do not
collide in `assertPathAvailable` (false `ReuseConflictError` «spec vs same spec»).

## Requirements

### Requirement: namespaced artifact paths include schemaHash
При `reuseOnConflict: "namespace"` builders `buildNamespacedModelArtifactRelativePath` и `buildNamespacedSchemaArtifactRelativePath` ДОЛЖНЫ включать короткий `schemaHash` (не менее первых 8 hex-символов) в relative path store-артефакта вместе с `specItem` и `optionsSliceHash`.

Цель: два конфликта с одним и тем же `specItem` и одним `optionsSliceHash`, но разными schema, НЕ ДОЛЖНЫ получать один и тот же relative path (иначе `ReuseStore.assertPathAvailable` бросает `ReuseConflictError` даже при включённом namespace).

Формат пути (model/enum):

`artifacts/{models|enums}/{path}__{specItem}__{schemaHash8}__{optionsSliceHash8}.ts`

Формат пути (schema):

`artifacts/schemas/{path}Schema__{specItem}__{schemaHash8}__{optionsSliceHash8}.ts`

#### Scenario: одинаковая спека, разный schemaHash — разные paths
- **WHEN** для модели/enum вызывается namespaced builder с одним `specItem` и одним `optionsSliceHash`, но двумя разными `schemaHash`
- **THEN** полученные relative paths различны и оба содержат соответствующий 8-символьный префикс schemaHash

#### Scenario: marauder example не падает на повторном конфликте v3
- **WHEN** пользователь запускает `generate -ocn ./example/openapi.marauder.config.json` при уже существующем namespaced-артефакте `EEnumWithNumbers` для `v3` с другим schemaHash в store
- **THEN** генерация НЕ завершается `ReuseConflictError` вида schema mismatch between `"v3"` and `"v3"`; namespace-ветка пишет артефакт по уникальному path с новым schemaHash
