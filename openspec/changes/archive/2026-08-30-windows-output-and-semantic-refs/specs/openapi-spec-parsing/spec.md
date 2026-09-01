## ADDED Requirements

### Requirement: Output mapping intern-ключи парсера в сгенерированный .ts
Output mapping MUST отображать intern-точный source file локального Canonical Ref в сгенерированный путь `.ts` под Virtual file map. Когда `specRoot` нормализован в POSIX, а ключ парсера использует `\`, Output mapping MUST всё равно класть файл под `outputModels`. Output mapping MUST NOT быть `$ref` lookup и MUST NOT применяться к Remote `$ref`. Отсутствие `Nested.ts` из `#/properties/…` MUST NOT считаться шумом CRLF-снимков.

#### Scenario: POSIX specRoot vs ключ парсера с обратными слешами
- **WHEN** `specRoot` Entry file задан со слешами POSIX, а ключ Virtual file map — intern-точный путь парсера с `\` для локального файла схемы
- **THEN** Output mapping MUST записать `.ts` этого файла под `outputModels` (`relativeHelper` MUST NOT выбросить его за пределы сгенерированного дерева)

#### Scenario: Nested.ts из #/properties на v3.withDifferentRefs
- **WHEN** `generate()` запускается на `v3.withDifferentRefs` и завершается
- **THEN** сгенерированное дерево MUST содержать `Nested.ts` из `#/properties/…`, а индекс MUST по-прежнему экспортировать `INested` (и `TProp` / `Prop.ts` как сейчас)
- **THEN** если файла нет, причина MUST быть подтверждена как Output mapping (исход 1) или идентичность / фильтр модели (исход 2) до фикса; MUST NOT приписываться CRLF-снимкам

#### Scenario: Semantic-diff +1 на той же фикстуре — тот же поток
- **WHEN** semantic-diff `v3.withDifferentRefs` сообщает +1 breaking
- **THEN** расследование MUST считать intern-промах expand и идентичность/Output mapping Nested.ts одним потоком, а не отдельным сбоем CRLF или pathHelpers
