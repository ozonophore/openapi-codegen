## ADDED Requirements

### Requirement: новый файл примера конфига для функций Marauder V6
В директории `example/` ДОЛЖЕН быть создан новый файл `example/openapi.marauder.config.json`. Файл ДОЛЖЕН демонстрировать все пять новых root-уровневых опций Marauder V6 (`workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze`, `reuseMode`) в реалистичном сценарии multi-spec монорепозитория с как минимум двумя items. Файл ДОЛЖЕН быть валидным `.json` с описательными значениями полей без комментариев, в соответствии с форматом существующего `example/openapi.config.json`. Все поля ДОЛЖНЫ использовать реалистичные, неплейсхолдерные значения, которые пользователь может скопировать и адаптировать.

#### Scenario: файл существует и является валидным JSON
- **WHEN** файл `example/openapi.marauder.config.json` разбирается через `JSON.parse`
- **THEN** синтаксическая ошибка не выбрасывается

#### Scenario: файл содержит все пять новых root-уровневых полей Marauder V6
- **WHEN** содержимое файла проверяется
- **THEN** на root-уровне присутствуют все пять полей: `workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze` и `reuseMode`

#### Scenario: файл содержит массив items с несколькими спеками
- **WHEN** содержимое файла проверяется
- **THEN** массив `items` содержит как минимум два элемента с различными путями `input` и `output`, иллюстрируя, что `workspaceReport` и `swarm` имеют смысл в multi-spec контексте

#### Scenario: workspaceReport использует объектную форму со всеми sub-полями
- **WHEN** содержимое файла проверяется
- **THEN** `workspaceReport` является объектом с полями `enabled`, `path` и `format`, а не булевым сокращением

#### Scenario: trafficSplitter использует объектную форму с полями strategy и weight
- **WHEN** содержимое файла проверяется
- **THEN** `trafficSplitter` является объектом с полями `enabled`, `strategy`, `oldClientWeight`, `newClientWeight`, `stickySessions` и `sessionDuration`

#### Scenario: swarm использует объектную форму с полем output
- **WHEN** содержимое файла проверяется
- **THEN** `swarm` является объектом с полями `enabled` и `output`

#### Scenario: reuseMode установлен в auto-group
- **WHEN** содержимое файла проверяется
- **THEN** `reuseMode` равно `"auto-group"` и `cacheStrategy` равно `"reuse"`, чтобы удовлетворить зависимость `reuseMode: auto-group`

---

### Requirement: существующий файл example/openapi.config.json не изменяется
Файл `example/openapi.config.json` НЕ ДОЛЖЕН изменяться. Весь новый контент с примерами Marauder V6 помещается в отдельный файл `example/openapi.marauder.config.json`.

#### Scenario: существующий файл примера не изменён
- **WHEN** содержимое `example/openapi.config.json` сравнивается до и после этого изменения
- **THEN** оно побайтово идентично
