## Purpose

Centralizes conversion of relative option path fields to absolute POSIX paths once at the generate entry, so core modules receive already-resolved paths and do not call `resolveHelper(process.cwd(), ...)`.

## Requirements

### Requirement: normalizePathsToAbsolute превращает все path-поля в абсолютные POSIX-пути

Система ДОЛЖНА предоставлять функцию `normalizePathsToAbsolute(result: ResolveGenerationOptionsResult, cwd: string): ResolveGenerationOptionsResult` в `src/core/resolveGenerationOptions.ts`.

Функция ДОЛЖНА для каждого item в `result.items` применить `resolveHelper(cwd, value)` ко всем следующим строковым полям с ненулевым значением: `input`, `output`, `outputCore`, `outputModels`, `outputServices`, `outputSchemas`, `request`, `customExecutorPath`, `prettierConfigPath`, `governanceConfig`, `reportFile`, а также к полю `path` каждого элемента массива `plugins`.

Поле `cachePath` НЕ ДОЛЖНО нормализоваться относительно `cwd`: для `cacheStrategy: 'entity'` оно разрешается относительно output-директории внутри setup.

Функция ДОЛЖНА пропускать поля, чьё значение является пустой строкой, `undefined` или `null`.

Функция ДОЛЖНА возвращать новый объект `ResolveGenerationOptionsResult` — не мутировать переданный.

#### Scenario: Относительный `input` становится абсолютным

- **WHEN** item содержит `input: './api/spec.yaml'` и `cwd` равен `/workspace`
- **THEN** после нормализации `item.input` ДОЛЖЕН быть `/workspace/api/spec.yaml`

#### Scenario: Уже абсолютный путь не изменяется

- **WHEN** item содержит `input: '/absolute/path/spec.yaml'`
- **THEN** после нормализации `item.input` ДОЛЖЕН остаться `/absolute/path/spec.yaml`

#### Scenario: Пустая строка пропускается

- **WHEN** item содержит `outputCore: ''`
- **THEN** после нормализации `item.outputCore` ДОЛЖЕН остаться `''` без применения `resolveHelper`

#### Scenario: `plugins[].path` нормализуется в каждом item

- **WHEN** item содержит `plugins: [{ path: './plugins/my-plugin.js', config: {} }]`
- **THEN** после нормализации `plugins[0].path` ДОЛЖЕН быть абсолютным относительно `cwd`

---

### Requirement: OpenApiClient вставляет normalizePathsToAbsolute между resolve и session.run

`OpenApiClient.generate()` ДОЛЖЕН вызывать `normalizePathsToAbsolute(resolveResult, process.cwd())` сразу после `resolveGenerationOptions(rawOptions)` и до передачи `items` в `GenerationBatchSession.run`.

#### Scenario: Facade нормализует перед запуском батча

- **WHEN** `OpenApiClient.generate(rawOptions)` вызывается с `rawOptions.items[0].input = './api/spec.yaml'`
- **THEN** `GenerationBatchSession.run` ДОЛЖЕН получить items с абсолютным `input`

---

### Requirement: Core-функции не вызывают process.cwd() для нормализации путей

После данного изменения ни одна функция в `src/core/` НЕ ДОЛЖНА содержать вызов `resolveHelper(process.cwd(), ...)` для нормализации путевых полей из `TStrictFlatOptions`.

#### Scenario: setupGenerationBatch не вызывает process.cwd() для input/output

- **WHEN** `setupGenerationBatch` обрабатывает items
- **THEN** функция ДОЛЖНА использовать `item.input` и `item.output` напрямую без вызова `resolveHelper(process.cwd(), ...)`

---

### Requirement: Допустимые исключения process.cwd() на границах

Следующие вызовы `resolveHelper(process.cwd(), ...)` в `src/core/` ДОПУСТИМЫ и НЕ считаются нормализацией полей `TStrictFlatOptions`:

1. **Spec-load boundary** — `resolveOpenApiRefsFromFile` / `resolveOpenApiRefsFromObject` ДОЛЖНЫ абсолютизировать `input` / `sourceFile` перед `SwaggerParser`, потому что refs keyed по абсолютному пути, а API вызывается и вне facade (тесты, `createResolvedContext`). На generate-пути повторный resolve уже абсолютного `item.input` безопасен (idempotent).

2. **CLI plugin dedupe до normalize** — `pluginPathDedupeKey` в `pluginEntries.ts` ДОЛЖЕН резолвить путь через `process.cwd()`, потому что `mergePluginPaths` в CLI выполняется до `normalizePathsToAbsolute` и должен схлопывать эквиваленты вроде `./a.cjs` и `a.cjs`.

#### Scenario: Spec-load абсолютизирует относительный input

- **WHEN** `resolveOpenApiRefsFromFile('test/spec/v3.yml')` вызывается напрямую
- **THEN** функция ДОЛЖНА передать в SwaggerParser абсолютный путь и вернуть его как `absoluteInput`

#### Scenario: Plugin merge dedupe до нормализации

- **WHEN** `mergePluginPaths(['./a.cjs'], ['a.cjs'])` вызывается до `normalizePathsToAbsolute`
- **THEN** результат ДОЛЖЕН содержать один entry (пути эквивалентны после resolve относительно CWD)
