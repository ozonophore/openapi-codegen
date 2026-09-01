## Context

`plugin-factory-api` заархивирован: авторы могут поставлять factory-модули; объекты v1/v2 по-прежнему хранятся как authored. ADR `0002` откладывал wrap. Этот change — тот заход.

## Goals / Non-Goals

**Goals:**
- Один runtime `apiVersion: '3'` после load / attach Context / semantic-diff хуков
- Builtin `x-typescript-type` написан как factory
- `configure()` по-прежнему вызывается на **исходном** объекте, затем wrap

**Non-Goals:**
- Композиция нескольких `on*`
- Object `--plugins` в CLI
- Смена авторского export v1/v2

## Decisions

### Decision 1: Wrap после configure
Loader: материализация → `configure` на авторском объекте → `wrapLegacyPlugin`. `this` внутри `configure` остаётся export.

### Decision 2: In-place wrap, та же ссылка
Если `apiVersion === '3'`, вернуть плагин без изменений. Иначе заменить функции хуков/`configure` на **том же объекте**, выставить `apiVersion` в `'3'`. Без клона — состояние `configure` на `this` остаётся на инстансе, который держат тесты и Context.

### Decision 3: Привязать `this` к этому объекту
Заменённые методы вызывают прежнюю функцию через `.call(plugin, …)`, чтобы извлечённые handler всё ещё видели инстанс плагина.

### Decision 4: Builtin — sync factory
`createXTypescriptTypePlugin` синхронный; `buildFactoryPluginSync` материализует `xTypescriptTypePlugin` при загрузке модуля для parser-тестов.

### Decision 5: Wrap на трёх швах
Loader (production), конструктор Context (прямая подстановка), `applySemanticDiffPluginHooks` (analyze-diff может получить смешанный массив).

## Risks / Trade-offs

- **[Риск] `plugins[0].apiVersion` после load равен `'3'` для v1-файла** → задокументировать; тесты проверяют wrap
- **[Риск] Двойной wrap клонирует** → идемпотентность, та же ссылка
- **[Риск] Async factory у builtin** → для builtin только sync factory

## Migration Plan

- Авторские файлы v1/v2 не меняются. Runtime `apiVersion` у загруженных инстансов становится `'3'`.
- Откат: вернуть wrap и перепись builtin.

## Open Questions

_(нет)_
