## MODIFIED Requirements

### Requirement: optionsSlice включает конфигурацию плагинов
`buildOptionsSlice` MUST включать сериализованную конфигурацию каждой записи плагина
(не только имя). Object entry `{ path, name?, config? }` MUST использовать `path` как
идентификатор (или явный `name`), а `config` — как хешируемые опции. Изменение
object `config` MUST менять `pluginsHash`. Строковые записи `plugins: ['./p.cjs']` MUST
сохранять прежнее поведение hash.

#### Scenario: изменение конфигурации плагина инвалидирует hash
- **WHEN** плагин `{ path: './p.cjs', config: { mode: 'a' } }` меняет config на `{ mode: 'b' }`
- **THEN** `buildOptionsSlice` возвращает другой `pluginsHash`

#### Scenario: одинаковый конфиг плагина даёт одинаковый hash
- **WHEN** два конфига с идентичной object entry `{ path, name?, config? }`
- **THEN** `buildOptionsSlice` возвращает одинаковый `pluginsHash`

#### Scenario: path entry без name использует path как ключ
- **WHEN** записи `{ path: './p.cjs', config: { x: 1 } }` и `{ path: './p.cjs', name: './p.cjs', config: { x: 1 } }`
- **THEN** `pluginsHash` совпадает
