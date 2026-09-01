# Plugin factory API даёт OpenApiGeneratorPlugin; wrap отложен

Plugin factory API (`apiVersion: '3'`) — авторский контракт (`PluginApi` + `createPlugin`), не второй runtime-тип. Loader собирает one-shot `on*` / `onConfigure` в `OpenApiGeneratorPlugin` и затем инжектит `plugins[].config` через существующий `configure()`. Объекты v1/v2 остаются как authored. Плоский объект с `apiVersion: '3'` — ошибка загрузки: `'3'` означает только factory-форму.

Термины: `CONTEXT.md` (Language).

## Considered Options

- **wrapLegacyPlugin / нормализовать каждый плагин в runtime `'3'` (fixup PDTCH-174):** одна runtime-форма, но переписывает builtin и сталкивается с `configure()` / `pluginEntries` на текущем master. Отложено (сделано в ADR 0003).
- **Factory возвращает `OpenApiGeneratorPlugin` без `PluginApi`:** меньше типов, отказ от июньского авторского контракта. Отклонено.
- **Warn+load плоского `apiVersion: '3'` как v1/v2 (тогдашняя спека):** `'3'` означало бы две разные формы. Отклонено.
- **Второй канал config в `createPlugin(api, config)`:** дублирует `configure()` из PDTCH-191. Отклонено.

## Consequences

- Спека `generator-plugins` должна убрать «v3 factory is not shipped» / warn-only `'3'`.
- Композиция массивов handler из `buildNormalizedPlugin` вне этого increment; повтор `on*` — ошибка.
- Builtin `x-typescript-type` остаётся объектом v1/v2 до захода wrap.
