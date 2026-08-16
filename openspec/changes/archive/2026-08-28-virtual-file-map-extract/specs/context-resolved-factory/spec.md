## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Context exposes resolveCanonicalRef
**Reason**: Метод `resolveCanonicalRef` переезжает на `VirtualFileMap.resolve()`. Вызывающие, которым нужен маппинг выходных путей, теперь берут `map` из `createResolvedContext`.
**Migration**: Заменить `context.resolveCanonicalRef(ref, parent)` на `map.resolve(ref, parent)`, где `map` берётся из `createResolvedContext`.

### Requirement: Context exposes getVirtualFiles
**Reason**: `getVirtualFiles()` не имел производственных вызывающих. Виртуальная файловая карта инкапсулирована в `VirtualFileMap`.
**Migration**: Использовать `map` из `createResolvedContext` напрямую.
