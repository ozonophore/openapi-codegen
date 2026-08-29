## Purpose

Factory that returns a fully initialized Context plus VirtualFileMap (`{ context, map, openApi }`) so generate/preAnalyze never hand-assemble half-initialized refs.

## Requirements

### Requirement: Resolved Context factory
Система ДОЛЖНА предоставлять `createResolvedContext`, которая при заданном пути spec-файла и параметрах конструктора Context загружает и разрешает OpenAPI-документ, инициализирует refs и VirtualFileMap внутри, и возвращает `{ context, map: VirtualFileMap, openApi }` готовым для парсеров. Производственные пути generate и preAnalyze ДОЛЖНЫ использовать эту фабрику и НЕ ДОЛЖНЫ вызывать публичную двухшаговую инициализацию. `getOpenApiSpec` НЕ ДОЛЖЕН оставаться как производственный хелпер.

#### Scenario: Successful resolve
- **WHEN** вызывающий вызывает `createResolvedContext` с существующим путём spec-файла
- **THEN** возвращённый `context` готов для парсеров (refs инициализированы), `map` готов для маппинга выходных путей, `openApi` — корневой документ

#### Scenario: Map available separately
- **WHEN** вызывающий деструктурирует результат `createResolvedContext`
- **THEN** `map: VirtualFileMap` доступен как самостоятельный объект и может быть передан в `getType.ts` без передачи всего `context`

#### Scenario: Missing file
- **WHEN** путь spec-файла не существует
- **THEN** фабрика завершается ошибкой до возврата Context

#### Scenario: Empty path
- **WHEN** путь spec-файла пуст
- **THEN** фабрика завершается ошибкой с явным сообщением об пустом пути

#### Scenario: Half-init not part of public API
- **WHEN** код приложения использует поддерживаемый путь генерации
- **THEN** он НЕ ДОЛЖЕН вызывать `addRefs` или `initializeVirtualFileMap` как отдельные публичные шаги

---

### Requirement: Context refs stay uninitialized until attach
`Context` MUST NOT assign a dummy `_refs` object in the constructor. Until `attachResolvedOpenApi` (or equivalent internal attach) runs, `values` / `get` / `paths` / `exists` MUST throw that Context is not initialized. `initializeVirtualFileMap` MUST NOT take an unused `rootSchema` argument.

#### Scenario: values before attach
- **WHEN** a Context is constructed and `values()` is called before attach
- **THEN** it MUST throw that Context must be initialized (not fail as a missing method on `{}`)
