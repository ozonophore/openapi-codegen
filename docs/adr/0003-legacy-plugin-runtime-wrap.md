# Legacy-плагины оборачиваются в runtime apiVersion 3 in-place

Авторские объекты v1/v2 сохраняют форму export. После `configure()` `wrapLegacyPlugin` ставит `apiVersion: '3'` на этот инстанс и перепривязывает хуки через `.call(plugin)`. Factory-плагины уже `'3'` и не клонируются. Builtin `x-typescript-type` написан как Plugin factory API.

Термины: `CONTEXT.md` (Language). Следует за ADR 0002 (там wrap был отложен).

## Considered Options

- **Клон в новый объект:** ломает `this.seen` после configure. Отклонено.
- **Оставить смешанный runtime:** factory `'3'` рядом с объектами v1/v2. Отклонено для этого change — так был предыдущий increment.
- **Композиция массивов handler из июньского `buildNormalizedPlugin`:** по-прежнему вне скоупа.

## Consequences

- После load `plugin.apiVersion` равен `'3'`, даже если в файле apiVersion не было или стояло `'1'`/`'2'`.
- Прямая подстановка в `Context` и `applySemanticDiffPluginHooks` тоже делают wrap, поэтому тесты без лоадера всё равно видят runtime `'3'`.
