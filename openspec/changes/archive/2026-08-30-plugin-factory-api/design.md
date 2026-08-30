## Context

Текущий loader принимает `PluginConfigEntry[]`, вызывает `configure()` на `OpenApiGeneratorPlugin` и предупреждает, что Plugin factory API не поставляется. PDTCH-174 (июнь) имел `PluginApi` + `wrapLegacyPlugin`; мы реплеим авторский контракт на сегодняшнем loader без wrap.

Термины: `CONTEXT.md`. Решение: `docs/adr/0002-plugin-factory-api-runtime.md`.

## Goals / Non-Goals

**Goals:**
- Загружать `{ meta, createPlugin }` и `createPlugin`+`.meta` в `OpenApiGeneratorPlugin`
- One-shot `PluginApi`, включая `onConfigure`
- Опциональный `PluginRuntimeContext` на вызовах хуков
- Отклонять плоские объекты `apiVersion: '3'`
- Сохранить injection `configure()` после материализации

**Non-Goals:**
- `wrapLegacyPlugin` / runtime `'3'` для v1/v2
- Перепись builtin `x-typescript-type` как factory
- Композиция массивов handler (`buildNormalizedPlugin` из PDTCH-174)
- Object-shaped `--plugins` в CLI

## Decisions

### Decision 1: Collector на factory-path, не wrap
Новый модуль `buildFactoryPlugin.ts`: `createPlugin(api)` → объект. Повтор `on*` / `onConfigure` бросает. Не июньский composer.

### Decision 2: Детект factory раньше legacy
`isFactoryModule` (`meta.apiVersion === '3'` + `createPlugin`) и factory-функция с `.meta` идут до проверки `{ name }`, чтобы `{ meta, createPlugin }` не отклонялся как невалидный export.

### Decision 3: `'3'` только factory
Legacy-объект с `apiVersion: '3'` проваливает загрузку. Прочие неизвестные версии на именованном объекте по-прежнему warn-and-load. Объект с и `name`, и `createPlugin` без factory `meta` падает (двусмысленный export).

### Decision 4: Runtime-контекст на вызывающих
`Context.resolveSchemaTypeOverride` передаёт `{ cwd: process.cwd(), executionMode: 'generate' }`. `applySemanticDiffPluginHooks` передаёт `analyze-diff` и может связать `emitDiagnostic` с `onDiagnostic`. `preAnalyze` идёт через Context → `generate`.

### Decision 5: Публичные типы
Экспорт `PluginApi`, `OpenApiPluginMeta`, `OpenApiPluginFactory`, `PluginRuntimeContext`, `PluginExecutionMode` из `plugins/index` и `core/index`.

## Risks / Trade-offs

- **[Риск] Существующий тест «warns but loads apiVersion 3»** → заменить на reject-flat-3 + успешную загрузку factory
- **[Риск] Авторы вызывают `on*` дважды, ожидая compose** → задокументировать one-shot; в ошибке имя хука
- **[Риск] Смешанный runtime удивит тех, кто ждёт wrap** → ADR 0002

## Migration Plan

- Аддитивно для v1/v2. Breaking только для плоских объектов `'3'` (валидных factory-плагинов среди них не было).
- Откат: вернуть коммиты factory на этой ветке.

## Open Questions

_(нет — grilling закрыт)_
