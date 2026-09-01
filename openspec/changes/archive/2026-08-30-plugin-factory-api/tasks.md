## 1. Типы и collector

- [x] 1.1 Расширить `GeneratorPlugin.model.ts`: `apiVersion` `'3'`, `PluginApi`, типы factory meta/module/function, `PluginRuntimeContext`, опциональный 2-й аргумент хуков, `onConfigure`
- [x] 1.2 Добавить `buildFactoryPlugin.ts`: one-shot `on*`, throw при повторе, материализация `OpenApiGeneratorPlugin` включая `configure`
- [x] 1.3 Экспорт типов из `plugins/index.ts` и `core/index.ts`

## 2. Loader и вызывающие

- [x] 2.1 Детект factory раньше legacy в `loadGeneratorPlugins`; отклонять плоский `'3'` и `name`+`createPlugin` без meta; warn для прочих неизвестных версий
- [x] 2.2 Передавать `PluginRuntimeContext` из `Context.resolveSchemaTypeOverride` (`generate`) и `applySemanticDiffPluginHooks` (`analyze-diff`, `emitDiagnostic` → `onDiagnostic`)

## 3. Тесты и docs

- [x] 3.1 Тесты loader: module factory, function factory, `onConfigure`+config, повтор `on*` бросает, плоский `'3'` бросает, `apiVersion: '4'` по-прежнему warn+load
- [x] 3.2 Тесты хуков: runtime `executionMode` на override и afterSemanticDiff
- [x] 3.3 Docs en/ru `plugins.md`: секция Plugin factory API; убрать «v3 factory is not shipped»

## 4. Проверка

- [x] 4.1 Юнит-тесты loader/хуков + `openspec validate plugin-factory-api`
