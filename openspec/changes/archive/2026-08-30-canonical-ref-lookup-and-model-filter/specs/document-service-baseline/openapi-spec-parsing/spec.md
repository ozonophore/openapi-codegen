## MODIFIED Requirements

### Requirement: Context ref resolution
При разрешении `$ref` lookup MUST переводить (Parent source file, Tree `$ref`) в Canonical Ref, равный ключу `$Refs`, через единый URI+intern переводчик. Lookup MUST NOT нормализовать `file#/Pointer` через filesystem path APIs. Несуществующие `$ref` MUST быть обнаруживаемы через exists-check контекста (промах intern или промах парсера).

#### Scenario: Unresolved ref в strict mode
- **WHEN** strict validation включена и `$ref` не resolves
- **THEN** в strict report регистрируется issue с code UNRESOLVED_REF

#### Scenario: Относительный файловый `$ref` идёт от файла-родителя, не от корня спеки
- **WHEN** Tree `$ref` равен `Pet.yaml` внутри `/schemas/Owner.yaml`
- **THEN** Context `get` / `exists` MUST целиться в intern-ключ соседнего файла, а не в путь относительно Entry file
