# Журнал изменений

Здесь документируются все заметные изменения в этом проекте.

Формат основан на Keep a Changelog, и проект следует правилам семантического версионирования.

## [2.1.0-beta.13] — 2026-07-17

Marauder Phase 2 (preview): workspace-отчёты, манифесты Avatar Swarm, хелпер TrafficSplitter, предгенерационный cross-spec анализ и `reuseMode: "auto-group"`, плюс укрепление ReuseStore и entity-кэша. Возможности по-прежнему opt-in (см. Известные ограничения).

### Добавлено

- **`--workspace-report` / конфиг `workspaceReport`**: после multi-spec `generate` пишет сводку по workspace (тайминги/reuse + shared models) в JSON и/или Markdown (`path`, `format`: `json` | `markdown` | `both`)
- **`--traffic-splitter` / конфиг `trafficSplitter`**: генерирует автономный `TrafficSplitter.ts` в output первого item для canary-роутинга (`weighted`, `round-robin`, `header-based`, `header-and-weighted`; sticky sessions, weights, headers). **Не** переключает живой трафик
- **`--swarm` / конфиг `swarm`**: пишет **манифест** Avatar Swarm (`avatars`, `sharedModels`, `operationIndex`) в `swarm.output` (по умолчанию `./swarm-manifest.json`) — без полной генерации клиентов на каждый сервис
- **`--pre-analyze` / конфиг `preAnalyze`**: парсит все items и печатает в stdout пересечения моделей и name-hash конфликты между спеками до записи файлов клиента
- **`--reuse-mode` / конфиг `reuseMode`**: `copy` (по умолчанию) или `auto-group` (каноника в `{LCA}/__shared__/`, в клиентах — stubs `export * from '…'`). Требует `cacheStrategy: "reuse"`; при тривиальном LCA или выключенном reuse — fallback на `copy` с предупреждением
- Nested CLI-парсинг для `workspace-report`, `traffic-splitter` и `swarm` (boolean + dot-notation / inline JSON), тот же паттерн, что у `--auto-select` / `--spec-analysis`
- Пример конфига: `example/openapi.marauder.config.json`
- Программные экспорты: `AvatarSwarmGenerator`, `writeSwarmOutput`, `TrafficSplitter`, `generateTrafficSplitterModule`, `buildWorkspaceReport`, `writeWorkspaceReport` и связанные типы
- Схема конфигурации расширена опциональными `workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze`, `reuseMode` (аддитивно; при необходимости — `update-config`)

### Изменено

- **CLI / logger UX:** оставшиеся русскоязычные пользовательские строки в `LoggerMessages`, help опций `init` и интерактивных выборах `check-config` переведены на английский
- **Целостность ReuseStore:** атомарная запись манифеста (tmp + rename), восстановление после битого JSON с очисткой orphan-артефактов, обязательная проверка content hash при чтении, multi-entry индекс name/kind для детекции конфликтов
- **Отпечатки артефактов:** в хэш входят дополнительные поля схемы (`minimum`/`maximum`/`pattern`/`const`/`discriminator`/границы length и items и т.д.), сортировка `required`/`enum`, защита от циклов `$ref`, в `pluginsHash` учитывается **config** плагинов (не только имена)
- **`GenerationCache`:** алгоритм хэша SHA-256 → MD5; удаление непрочитанных ключей при сохранении; устойчивость к повреждённому файлу кэша
- Entity-кэш также сохраняется, когда class-mode форсирует reuse fallback (`needsEntityCacheFallback`)
- Предупреждение multi-item фокусируется на расхождении `modelsMode` (релевантно reuse), а не на расхождении настроек cache
- Cross-spec анализ больше не эмитит отдельные ранние findings категории «drift» (conflicts / reuse opportunities / output collisions остаются)

### Исправлено

- Коллизии путей reuse / edge cases целостности закрыты более строгим fingerprinting и проверкой хэша
- Разрастание entity-кэша за счёт устаревших неиспользуемых ключей — ключи prune’ятся при save
- Повреждённый reuse-манифест / entity-кэш больше не уходит в inconsistent state без recovery

### Breaking Changes

- Существующие **entity-кэши** и **fingerprint’ы reuse store** могут инвалидироваться после апгрейда (ожидаемая холодная регенерация / больше miss) из‑за MD5-ключей кэша и расширенного schema/plugin hashing
- Потребители, опирающиеся на findings **`cross-spec-drift`**, больше не увидят эту категорию
- Preview: `trafficSplitter` / `swarm` — хелперы/манифесты; они **не** возвращают удалённые CLI-команды `heal` / `migrate` / полный swarm из более ранних Marauder preview-сборок

### Известные ограничения (preview)

- `workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze` и `reuseMode` ориентированы на **root**; при multi-item `trafficSplitter` пишет в output **первого** item (с предупреждением)
- `reuseMode: "auto-group"` требует нетривиальный общий предок у output-путей; иначе fallback на `copy`
- Манифест swarm пока минимален по `operationIds` / operation index (namespaced stubs по items)
- Optimization / live migration / remote heal по-прежнему вне scope (как в Marauder refocus)
- Merge блоков Marauder — shallow/deep только там, где это уже определено для существующих блоков

## [2.1.0-beta.12] — 2026-07-08

**Переработка документации с принципом прогрессивного раскрытия.** README переделан для лучшего первого впечатления пользователя, все страницы документации реорганизованы по контексту применения и многоуровневому справочнику, гайд Marauder консолидирован в `features.md`, три корневых файла-редиректа удалены для ясности.

### Добавлено

**README и быстрый старт**
- **Быстрый старт** в обоих README: `install` → `init` → `generate` → импорт TypeScript, читается за 2 минуты.
- **Сгруппированное резюме возможностей** в README: 3 категории (Генерация, Анализ и CI, Продвинутое / Preview), каждая с ≤ 5 пунктами, вместо плоского списка из 30 пунктов.
- **Таблица всех CLI-команд** со столбцом контекста «Когда использовать» для всех 7 команд.

**Страницы документации**
- **Таблица быстрых решений** в начале `docs/en/usage.md` и `docs/ru/usage.md`: «Я хочу… → Используй эту команду» для всех операций CLI.
- **Блок контекста «Когда использовать»** (1–3 предложения) перед таблицей опций каждой команды в `docs/en/usage.md` и `docs/ru/usage.md`.
- **Шестиуровневый справочник конфигурации** в `docs/en/configuration.md` и `docs/ru/configuration.md`:
  - Уровень 1: Базовые/обязательные опции
  - Уровень 2: Структура вывода
  - Уровень 3: Стиль кода и генерация
  - Уровень 4: Diff и Governance
  - Уровень 5: Кэш / Стратегии переиспользования
  - Уровень 6: Preview (Marauder)
  - Для каждого уровня — вводное предложение о ценности.
- **Раздел Marauder Preview Features** в `docs/en/features.md` и `docs/ru/features.md`:
  - Карта возможностей с быстрой навигацией.
  - Сценарии A–F с полными рабочими примерами.
  - Справочник по каждой фиче: `--auto-select`, `--spec-analysis`, кэш/переиспользование, программный API, известные ограничения.
  - Контент мигрирован из удалённого `docs/MARAUDER_USER_GUIDE.md`.
- **Пример сценария F** (monorepo со всеми фичами Marauder): multi-item конфиг с per-item `autoSelect` + `specAnalysis` + общий reuse store, плюс CI/CD сниппет.
- **Три примера пользовательского пути** в `docs/en/examples.md` и `docs/ru/examples.md`:
  - Первый раз: новый проект с нуля (5 минут).
  - Командная настройка: multi-spec конфиг с общей конфигурацией.
  - Полный CI/CD: автоматизированная генерация и валидация в pipeline.

### Изменено

- Раздел README «Зачем этот инструмент?» заменён коротким нарративом из 3 предложений (без списка) для более естественного чтения.
- **Внутренние ссылки в документации** обновлены везде:
  - `docs/MARAUDER_USER_GUIDE.md` → `features.md#marauder-preview-features`
  - Корневые заглушки `docs/plugins.md` / `docs/plugin-api-v2.md` → `docs/en/plugins.md` / `docs/ru/plugins.md` (локализованные канонические версии).
- **Node.js request-шаблон** (`src/templates/client/core/node/request.hbs`): импорт `AbortController` теперь подключается условно, только когда `useCancelableRequest` равен `true`, снижая размер бандла для проектов, которые не используют отмену запросов.

### Удалено

- `docs/MARAUDER_USER_GUIDE.md` — контент полностью перенесён в `docs/en/features.md` и `docs/ru/features.md`.
- `docs/plugins.md` и `docs/plugin-api-v2.md` — двухстрочные HTTP-редиректы удалены; локализованные страницы в `docs/en/` и `docs/ru/` теперь являются каноническим источником.
- Секция **Agent Skills** из обоих README (ранее ссылалась на неопубликованную директорию `skills/`; будет возвращена когда skills будут готовы для публичного релиза).

## [2.1.0-beta.11] — 2026-06-12

Marauder refocus preview: проектно-зависимый auto-select, анализ OpenAPI-спеки (`specAnalysis`) и инкрементальный кэш генерации с ReuseStore. Возможности включаются опционально (см. Известные ограничения).

### Добавлено
- **AutoSelector** (`--auto-select` / конфиг `autoSelect`): анализирует целевой проект (зависимости `package.json`, целевая платформа, подсказки по размеру бандла) и рекомендует оптимальные `validationLibrary` и `httpClient` с пояснениями и советами по оптимизации. Поддерживает `strict`, `preferSmallBundles`, `preferStandards` и пользовательские правила выбора (`src/core/autoSelect/`).
- **Вложенные Marauder CLI-флаги** через `parseNestedCliOptions`: dot-notation (`--auto-select.strict`, `--spec-analysis.fail-on-high`), inline JSON (`--auto-select='{"enabled":true}'`) и boolean-сокращения (`--spec-analysis=true`); обрабатываются до парсинга Commander
- **ReuseStore** (`cacheStrategy: "reuse"`): глобальный store артефактов в `.openapi-codegen-store` с путями с суффиксом `optionsSliceHash`, проверкой целостности, GC и `ReuseConflictError` при drift схемы; **`reuseOnConflict`** (`fail` | `namespace`) в CLI и конфиге
- **CodegenSpecAnalyzer** и **CrossSpecAnalyzer** (`--spec-analysis` / конфиг `specAnalysis`): per-spec и cross-spec детекторы качества OpenAPI; `crossSpec: true` по умолчанию. `--anomaly-detection` / `anomalyDetection` — устаревшие алиасы
- **Unified generation report** в `{output}/reports/latest.json` (или `<cachePath>/reports/latest.json` при reuse), когда включены `cache` или `specAnalysis`
- **`cacheStrategy: "content"`**: явный content-only режим инкрементальной записи (без entity/reuse store)
- **`--fail-on-governance-errors`** / конфиг **`failOnGovernanceErrors`**: прерывание `generate` при ошибках governance (требует `--strict-openapi`)
- **`reuseWriterHelpers`**: общий DRY-слой для writers model/schema reuse
- **`mergeSpecAnalysisConfigAcrossItems`**: объединение настроек `specAnalysis` в multi-item конфигах
- **Per-item autoSelect overrides** при расхождении рекомендаций probe между output
- **`analyze-usage --diff-report`**: перекрёстная проверка RENAME miracles из `analyze-diff` с импортами потребителя; path-based scope API-импортов через TypeScript module resolution (поддержка aliases); общий **`ProjectProbe`**; сканируется только `{projectPath}/src/**/*.{ts,tsx}`
- **Программные экспорты** из `core`: `AutoSelector`, `ProjectProbe`, `runSpecAnalysis`, `CodegenSpecAnalyzer`, `CrossSpecAnalyzer`, `ReuseStore`, `GenerationReport` и связанные типы
- Опциональные блоки конфигурации `autoSelect` и `specAnalysis`; существующие конфиги мигрируют автоматически через `update-config`

### Изменено
- **Breaking:** дефолтные пути CLI-отчётов теперь в `./.openapi-codegen-reports/` вместо корня проекта (`openapi-report.json`, `anomaly-report.*`, `openapi-diff-report.json`, `openapi-usage-report.json`, `eslint-fix-report.json`). Явные пути в флагах и конфиге не меняются.
- **Marauder refocus** на spec analysis и reuse артефактов во время генерации
- Обновления схемы конфигурации аддитивные и обратно совместимые; для старых файлов выполните `update-config`
- **`specAnalysis`** — канонический config/CLI блок; `anomalyDetection` остаётся устаревшим алиасом
- **`runAnomalyDetection`** — тонкий устаревший алиас к `runSpecAnalysis` (без двойного запуска)
- **`failOnHigh`** / legacy **`failOnAnomalies`** проверяются только после завершения cross-spec анализа
- **CLI `--cacheStrategy`** больше не подставляет `entity` или `reuse` по умолчанию; не указывайте флаг, чтобы сохранить значение из конфига (`update-config` может поставить `entity` для совместимости со старыми конфигами; актуальный дефолт схемы — `reuse`)
- **Дефолтный `cachePath`** в runtime defaults: `.openapi-codegen-cache.json` → **`.openapi-codegen-store`**
- **AutoSelector**: fallback валидатора по умолчанию — `NONE` (был `ZOD`)
- Cross-spec drift/conflict findings дедуплицируются; cross-spec детекторы учитывают `filterSpecFindings`

### Удалено
- CLI-команды: **`heal`**, **`migrate`**, **`swarm`**
- **`--exploit-anomalies`** / конфиг **`anomalyExploitation`**
- Модули ядра: `AnomalyExploiter`, стек Avatar Swarm, gradual migration runtime, `SelfHealingClient`
- Handlebars-шаблоны клиентских оптимизаций и микросервисов

### Исправлено
- Коллизии путей артефактов при одном имени модели с разным `validationLibrary` или префиксами
- CLI `--cacheStrategy` перетирал config `cacheStrategy: "entity"`, когда флаг не передавался
- Частичный unified generation report при `ReuseConflictError`
- Дубликаты cross-spec name-hash drift; `failOnHigh` с относительными output в multi-item конфигах
- `OpenApiClient`: `autoSelect` и `specAnalysis` пробрасываются в нормализованные опции элемента и не перетираются значениями по умолчанию
- `analyze-usage`: Zod-схема приведена к CLI-флагам (`--sourcePath`, `--projectPath`); path-based import scope вместо хрупкого сопоставления по имени модуля

### Известные ограничения (preview)
- `--auto-select` применяется при генерации из `openapi.config.json` или merged multi-item конфигов
- `specAnalysis` сообщает о проблемах качества; спеки автоматически не исправляет
- Reuse store требует `modelsMode: "interfaces"` (по умолчанию); режим classes отключает reuse артефактов
- Shallow merge для Marauder config blocks (не recursive deep merge)

## [2.1.0-beta.10] — 2026-06-19

### Добавлено
- Добавлен сгенерированный `core/executor/legacyRequestAdapter.ts` с `createLegacyRequestAdapter()` — мост между legacy-транспортом `request(options, config)` и контрактом `RequestExecutor` (с пробросом `requestRaw`, если кастомный транспорт его экспортирует).
- Добавлены форматы CLI-скaffold для `init --request` через `--requestFormat`: `transport` (legacy `request` + `requestRaw`), `adapter` (`createExecutorAdapter` для `customExecutorPath`), `executor` (автономный объект `RequestExecutor`).
- Добавлен CLI-шаблон `customCreateExecutorAdapter.hbs` и интерактивный выбор формата scaffold в `init`.
- Добавлен `validateExecutorSetup()` в `check-config` — некритичные предупреждения, если файлы `request` / `customExecutorPath` отсутствуют или `customExecutorPath` не экспортирует `createExecutorAdapter`.
- Добавлен класс `RequestRecovery` для error interceptors — возврат восстановленного значения из `onError` вместо повторного throw.
- Добавлен helper `isRequestRecovery()` в сгенерированный `core/interceptors/interceptors.ts` — определяет recovery через `Symbol.for`-метку (надёжно при повторной загрузке модулей interceptors, напр. dynamic import + coverage).
- Добавлен `example/executor.ts` — эталонная ky-реализация `createExecutorAdapter`.
- Добавлена запись `skills/` в npm `files`; секция Agent Skills в README для миграции RequestExecutor и Marauder.
- Добавлена runtime-зависимость `ky` (используется в example adapter).

### Изменено
- Рефакторинг шаблона `createExecutorAdapter` — единое преобразование `RequestConfig` → `ApiRequestOptions` через `toApiRequestOptions()` / `toMergedOptions()`; всегда делегирует в транспортный `request` / `requestRaw`.
- `writeClientCore` копирует `customExecutorPath` в сгенерированный `core/executor/createExecutorAdapter.ts` и определяет экспорт `requestRaw` в кастомном транспорте для legacy adapter.
- Типы возврата `RequestExecutor` используют `CancelablePromise` при включённом `useCancelableRequest`.
- `catchErrors` / транспортный `ApiError` — поле `request` стало slim config (`method`, `path`, `headers`, `query`, `body`); payload ответа перенесён в `body`.
- `createClient` всегда оборачивает executor в `withInterceptors` (включая дефолтный `apiErrorInterceptor`); больше не импортирует `customExecutorPath` в runtime.
- Поток `init` выставляет `request` или `customExecutorPath` в конфиге по выбранному формату scaffold (`resolveHttpConfigPaths`).
- Обновлены CLI-scaffold (`customRequest.hbs`, `customRequestExecutor.hbs`) — legacy-сигнатура транспорта, `requestRaw`, обработка `ApiError`, подсказки по миграции.
- Обновлены примеры RequestExecutor в `docs/en/features.md` и `docs/ru/features.md` (`buildUrl`, `requestRaw`, `OpenAPI.BASE`).
- Сгенерированный client core (`indexCore`) экспортирует `isRequestRecovery` вместе с `RequestRecovery`.

### Исправлено
- `withInterceptors` — request interceptors теперь мутируют `currentConfig`, используемый в error handlers; `RequestRecovery` из `onError` проходит через response interceptors для `request` и `requestRaw`.
- `withInterceptors` — recovery определяется через `isRequestRecovery()` вместо `instanceof RequestRecovery`; исправлен случай, когда `RequestRecovery` повторно бросался как ошибка при dynamic import (CI publish workflow).
- `apiErrorInterceptor` — повторно не оборачивает уже существующие экземпляры `ApiError`.
- `createExecutorAdapter` с кастомным `request` в конфиге — некорректное делегирование при legacy-сигнатуре `ApiRequestOptions`.
- Пробелы валидации кастомного executor-файла в workflow `check-config`.

### Ломающие изменения
- `createClient` всегда применяет `withInterceptors` + дефолтный `apiErrorInterceptor` (ранее — только при наличии `options.interceptors`).
- Модуль `customExecutorPath` копируется в сгенерированный output при генерации; `createClient` больше не импортирует исходный путь в runtime.
- `ApiError.request` из транспорта больше не содержит полный `ApiRequestOptions` — используйте slim config или читайте payload из `error.body`.

### Тесты
- Добавлены: `requestExecutorInterceptors.test.ts` (`withInterceptors`, `RequestRecovery`, `validateExecutorSetup`).
- Усилен `requestExecutorInterceptors.test.ts` — типизированный loader generated-runtime, изолированный output под `test/generated/`, порядок import, совместимый с coverage.
- Расширены: `customRequestRaw.test.ts`, `index.test.ts` (legacy adapter snapshots, копирование custom executor, interceptor pipeline).
- Обновлены snapshots v2/v3/lom_api для `legacyRequestAdapter`, `createExecutorAdapter`, interceptors и `createClient`.

## [2.1.0-beta.9] — 2026-06-10

### Добавлено
- Добавлен унифицированный diff-отчёт `schemaVersion: "2.0.0"` с секциями `semantic` и `structural`, а также `metadata` (пути base/target, SHA-256 хеши, timestamp).
- Добавлен слой адаптации semantic→structural (`adaptSemanticToStructural`, `semanticChangesToDiffEntries`, `semanticPointerToJsonPath`).
- Добавлен `buildMiraclesFromSemanticChanges` — автоматическое обнаружение RENAME (эвристика Levenshtein) и TYPE_COERCION miracles из semantic-изменений свойств.
- Добавлено селективное раскрытие `$ref` для analyze-diff (`expandOpenApiRefsForSemanticDiff`, `loadSemanticOpenApiSpec`) вместо полного dereference.
- Расширены payload-ы `SemanticDiffChange`: `from`/`to`, `fromRequired`/`toRequired`, `fromNullable`/`toNullable`; `CanonicalOperation` теперь хранит метаданные для ghost operations.
- Добавлен `resolveClassesModeTypes` и улучшены шаблоны сервисов/моделей в режиме `classes` (`exportService.hbs`, `exportModels.hbs`).
- Добавлен `assignDuplicateAliases` — пересмотренная нумерация алиасов дублирующихся моделей/импортов (первое совпадение сохраняет имя без суффикса, следующие получают `$2`, `$3`, …).
- Добавлены тестовые фикстуры LOM API v1/v2; example-конфиг обновлён с `useHistory` и `diffReport`.

### Изменено
- `analyze-diff` теперь пишет унифицированный отчёт 2.0.0; CI markdown summary читает `report.semantic.*`.
- `loadDiffReport` принимает 2.0.0 (извлекает `structural`), 1.1.0 (адаптирует) и legacy flat-отчёты; предупреждает о устаревшем/отсутствующем отчёте при включённом `useHistory`.
- `applyDiffReportToClient` / `prepareDtoModels` — ghost operations с path params, флаги coercion, обработка дублирующихся имён схем, нормализация ключей операций.
- Удалён неиспользуемый модуль `buildLegacyReport.ts`.

### Исправлено
- `generate --useHistory` молча игнорировал semantic-отчёты 1.1.0 в более ранних сборках 2.1.0 — восстановлено через цепочку адаптеров.
- Ghost properties/operations, TYPE_COERCION, RENAME getters и JSDoc `@info` для history-aware генерации.
- Сломанные импорты/типы в сгенерированных сервисах в режиме `classes`.
- Устаревший diff-отчёт использовался без предупреждения (проверка mtime относительно input spec).

### Удалено
- Неиспользуемые зависимости: `deep-diff`, `joi`, `@types/deep-diff`.

### Ломающие изменения
- Корневая схема вывода `analyze-diff` изменилась с плоской `1.1.0` на вложенную `2.0.0`:
  - `report.changes` → `report.semantic.changes`
  - `report.summary` → `report.semantic.summary`
  - `report.governance` → `report.semantic.governance`
  - `report.recommendation` → `report.semantic.recommendation`
  - `report.miracles` → `report.structural.miracles`
- Изменение конвенции алиасов дубликатов может изменить имена импортов в сгенерированном коде при коллизиях схем.

### Тесты
- Добавлены: `buildMiraclesFromSemanticChanges.test.ts`, `semanticChangesToDiffEntries.test.ts`, `semanticToStructural.test.ts`, `expandOpenApiRefsForSemanticDiff.test.ts`, `resolveClassesModeTypes.test.ts`, `analyzeDiffLomMiracles.test.ts`.
- Расширены: `loadDiffReport.test.ts`, `applyDiffReportToClient.test.ts`, `prepareDtoModels.test.ts`, `analyzeOpenApiDiff.test.ts`, `semanticDiffReportSchema.test.ts`, `analyzeDiff.cli.test.ts`.
- Обновлены LOM service snapshots и semantic diff fixture snapshots.

## [2.1.0-beta.8] — 2026-06-08

### Удалено
- Удалены `--useProjectPrettier` / `useProjectPrettier` и неявный резолв конфига Prettier из текущей рабочей директории.
- Удалён boolean-флаг `--useEslintFix` / `useEslintFix` и покфайловый ESLint `--fix` при записи.
- Удалены поля `useProjectPrettier` / `useEslintFix` из миграции конфига v4→v5.
- Удалены legacy e2e browser-тесты на Babel, `.babelrc.js` и связанные dev-зависимости `@babel/*`.

### Добавлено
- Добавлены `--prettierConfigPath` / `prettierConfigPath` — явный путь к файлу конфигурации Prettier для форматирования вывода.
- Добавлены CLI-флаги `--tsconfigPath` и `--eslintConfigPath` (ключи конфига на корневом уровне) для пакетного ESLint после генерации.
- Добавлен постгенерационный `eslintFixBatch`: временные tsconfig/ESLint-обёртки в `.openapi-codegen/`, chunked `lintFiles` и `eslint-fix-report.json` в корне проекта.
- Добавлена переменная окружения `ESLINT_FIX_BATCH_SIZE` для настройки размера чанка (по умолчанию: 50).
- Добавлен `example/eslint.example.mjs` — пример ESLint flat config для host-проекта.
- Добавлен стандартный комментарий-заголовок «автоматически сгенерированный файл» в вывод клиента (partial `header.hbs`).
- Добавлен Handlebars-хелпер `useBatchEslintFix`: при указании обоих ESLint-путей из сгенерированных файлов убираются inline `eslint-disable` / `tslint-disable`, чтобы host ESLint мог их исправить.
- Добавлен `WriteClient.registerLintTarget()` для сбора сгенерированных файлов перед пакетным lint.
- Добавлен pre-commit hook Husky и пайплайн lint-staged (`checkTypes`, `eslint:fix`, `find-deadcode:dev`).

### Изменено
- `format()` загружает настройки Prettier из `prettierConfigPath`, если файл существует; иначе — встроенные defaults (без неявного поиска в cwd).
- Пакетный ESLint `--fix` запускается один раз после завершения всех items при указании **обоих** `tsconfigPath` и `eslintConfigPath` (CLI или конфиг); если указан только один путь — шаг пропускается с предупреждением.
- `tsconfigPath` / `eslintConfigPath` доступны только на корневом уровне (исключены из per-item `flatOptionsSchema`).
- Direct CLI `generate` пробрасывает `prettierConfigPath`, `tsconfigPath` и `eslintConfigPath` из аргументов CLI.
- `UNIFIED_OPTIONS_v5` обновлён: `prettierConfigPath`, `tsconfigPath` и `eslintConfigPath` заменяют `useProjectPrettier` / `useEslintFix`.
- Конфиг Prettier перенесён из `.prettierrc.json` в `.prettierrc.js`; `src/templatesCompiled` исключён через `.prettierignore`.
- Обновлены README (EN/RU), MIGRATION (EN/RU) и документация configuration/usage под новые опции форматирования и lint.

### Тесты
- Добавлены/обновлены unit-тесты для `eslintFixBatch`, `format` (`prettierConfigPath`), `extractEslintFixOptions`, хелперов временных конфигов (`prepareTempTsConfig`, `prepareTempEslintConfig`) и рендеринга заголовка через `useBatchEslintFix`.
- Обновлены snapshot-наборы под новый заголовок в client/core/service output.

## [2.1.0-beta.7] — 2026-05-27

### Добавлено
- Добавлена команда `analyze-usage` в CLI для анализа использования сгенерированного API в проектах TypeScript и создания отчётов об использовании.
  - Добавлены опции: `--sourcePath`, `--projectPath`, `--tsconfigPath`, `--output`, `--check`
  - Реализован семантический анализ сервисов, моделей, схем, импортов, диагностик и покрытия
  - Добавлено сохранение JSON-отчёта для CI и локального анализа

### Изменено
- Унифицировано завершение CLI-команд: команды возвращают структурированный результат с флагом `success`, а итоговый код завершения выставляется в `src/cli/index.ts`.

## [2.1.0-beta.6] — 2026-05-23

### Добавлено
- Добавлены параметры управления кэшем генерации:
  - CLI-флаги `--cache`, `--cachePath`, `--cacheStrategy`, `--cacheDebug`;
  - ключи конфига `cache`, `cachePath`, `cacheStrategy`, `cacheDebug` в схемах генерации.
- Добавлена запись файлов с проверкой изменений (`writeFileIfChanged`), чтобы не переписывать неизмененные сгенерированные файлы.
- Добавлен `GenerationCache` с сохранением cache-entries (fingerprint + список сгенерированных файлов).

### Изменено
- Поток генерации теперь поддерживает cache-aware warm run (стратегия `entity`) и пишет статистику записи (`written`, `unchanged`).
- Разрешение пути кэша переведено в output-контекст:
  - путь по умолчанию — `<output>/.openapi-codegen-cache.json`;
  - относительный `cachePath` резолвится внутри соответствующей output-директории.
- При отключенном кэше и нескольких items с общим output теперь выводится одно агрегированное предупреждение с рекомендацией включить кэш.
- Переработана очистка output:
  - убрана полная очистка output-директорий перед генерацией каждого item;
  - добавлена селективная очистка stale-файлов после генерации на основе expected output files.
- В direct CLI-генерации сохранены cache-параметры при merge validated options в мигрированный конфиг.
- Обновлены значения по умолчанию:
  - `cache: false`;
  - `cachePath: .openapi-codegen-cache.json`;
  - `cacheStrategy: entity`;
  - `cacheDebug: false`.

### Удалено
- Удалена неиспользуемая dev-зависимость `ts-prune`.

### Исправлено
- `validateAndMigrateConfigData`: удаление полей `undefined` после `convertArrayToObject` перед миграцией схемы (legacy array-конфиги).

### Тесты
- Добавлены unit-тесты кеширования генерации в `test/cacheGeneration.test.ts`:
  - warm run не переписывает неизмененные файлы;
  - изменение спецификации инвалидирует кэш и обновляет output;
  - стратегия `content` сохраняет mtime для неизмененных файлов;
  - multi-item сценарий с общим output сохраняет файлы и устойчивые cache entries.
- Добавлены unit-тесты production-кода в `src/**/__tests__/` (префикс `@unit`, импорт из `src/`). Покрытие линий **88.41%** (было 87.42%):
  - `checkAndUpdateConfig`: utils и entrypoints `checkConfig` / `updateConfig`;
  - `initOpenApiConfig`: `init`, `initConfig`, utils (`buildConfig`, `findSpecFiles`, `validateSpecFiles`);
  - `previewChanges` utils (`compareFiles`, `updateOutputPaths`, …);
  - Zod-схемы CLI, в т.ч. `generateOptionsSchema`;
  - `templatesCompiled` через `templateRendering.test.ts`;
  - core: `loadDiffReport`, расширены `prepareDtoModels`.

## [2.1.0-beta.5] — 2026-04-28

### Добавлено
- Добавлен semantic diff движок для `analyze-diff` с машиночитаемым отчетом `schemaVersion: 1.1.0`:
  - классификация semantic-изменений моделей и операций (`breaking`, `non-breaking`, `informational`);
  - рекомендация semver (`major`/`minor`/`patch`) с confidence и reason-codes;
  - валидатор JSON-контракта отчета (`semanticDiffReportSchema`).
- Добавлен слой governance-policy и поддержка governance-конфига:
  - правила: `NO_BREAKING_WITHOUT_FLAG`, `REQUIRE_OPERATION_ID`, `NO_DEFAULT_WITHOUT_2XX`;
  - загрузка/валидация governance JSON (`--governance-config`);
  - summary/violations governance включаются в semantic diff и strict-отчеты.
- Добавлены точки расширения Plugin API v2 для semantic diff потока:
  - хуки: `afterSemanticDiff`, `mapRecommendation`, `beforeReportWrite`;
  - диагностика хуков и строгий режим ошибок плагинов (`--strict-plugin-mode`);
  - draft-документация: `docs/plugin-api-v2.md`.
- Добавлен CI-ориентированный вывод analyze-diff:
  - markdown summary в логах при `--ci`;
  - fail в CI при governance error-нарушениях.
- Добавлен пример policy-конфига `example/governance.json`.

### Изменено
- Переработан runtime `analyze-diff` на semantic pipeline с явной логикой выбора источника:
  - `--compare-with` имеет приоритет над `--git`;
  - при отсутствии обоих источников команда завершается успешно со skip-сообщением.
- Расширены CLI/Zod схемы и unified options полями governance:
  - `governanceConfig` добавлен в `generate` и общие опции;
  - схема `analyze-diff` дополнена semantic/governance/plugin-флагами.
- Обновлен формат strict OpenAPI отчета: добавлен блок `governance` и policy-aware проверки.
- Обновлена логика merge опций в CLI-генерации: прямые CLI-флаги (`strictOpenapi`, `reportFile`, `governanceConfig`) теперь приоритетнее мигрированных значений конфига.
- Legacy-утилиты report сохранены как отдельные модули, но основной путь `analyze-diff` теперь semantic.

### Исправлено
- Исправлен `getOperationResponseCode('default')`: `default` больше не приводится к HTTP `200` и теперь возвращает `null`.
- Исправлена обработка путей в `analyze-diff --git` для абсолютных путей спецификаций: перед `git show` путь нормализуется к относительному для репозитория.

### Тесты
- Добавлено широкое unit/CLI покрытие для semantic diff, governance-policy, plugin hooks и интеграции governance в strict-openapi.
- Добавлены тесты схемы `analyze-diff` для skip/prioritization-сценариев и тесты валидации схемы semantic-отчета.
- Добавлены/обновлены snapshot-наборы для semantic diff фикстур и затронутых сервисных output-файлов.

## [2.1.0-beta.4] — 2026-04-12

### Добавлено
- Добавлена плагинная система (v1) для кастомизации генератора:
  - опция `plugins` в схеме конфигурации;
  - встроенный плагин `x-typescript-type`;
  - загрузка плагинов из CJS/ESM и TS-модулей (если рантайм поддерживает импорт TS).
- Добавлена документация по плагинам: `docs/plugins.md`.

### Тесты
- Добавлено/обновлено unit-покрытие для загрузчики плагинов и поведения `x-typescript-type`;

## [2.1.0-beta.3] — 2026-04-09

### Добавлено
- Добавлены опциональные параметры пост-генерационного форматирования:
  - `--useProjectPrettier` / `useProjectPrettier`: форматирование сгенерированных файлов с конфигом Prettier проекта (`prettier.resolveConfig`); при отсутствии конфига — откат к встроенным значениям по умолчанию.
  - `--useEslintFix` / `useEslintFix`: запуск ESLint с `--fix` для каждого сгенерированного файла после записи, с использованием установленного в проекте `eslint` и его конфига; при отсутствии `eslint` — пропуск с предупреждением.
- Добавлена unified-схема `UNIFIED_OPTIONS_v5` с миграцией из `v4` (новые ключи по умолчанию `false`).

### Изменено
- Расширена функция `format(...)`: поддержка резолва Prettier-конфига проекта и более явные сообщения при ошибках Prettier.

### Тесты
- Добавлены unit-тесты для утилит `format` и `eslintFix`.

## [2.1.0-beta.2] — 2026-04-04

### Добавлено
- Добавлена опциональная строгая диагностика OpenAPI для `generate`:
  - флаги CLI `--strict-openapi` и `--report-file` (по умолчанию `./openapi-report.json`);
  - ключи конфигурации `strictOpenapi` и `reportFile` (Zod-схема `generate` и unified options).
- Добавлен пайплайн `validateOpenApiStrict`: пишет JSON-отчёт (summary + issues) и прерывает генерацию при наличии strict **ошибок**.
- Проверки strict-режима включают:
  - сбои `SwaggerParser.validate` (`OPENAPI_PARSER_VALIDATION_FAILED`);
  - неразрешённые `$ref` (`UNRESOLVED_REF`);
  - fallback media type при отсутствии `application/json` (`CONTENT_MEDIA_TYPE_FALLBACK`);
  - ответ `default` без явного 2xx успешного ответа (`SUSPICIOUS_DEFAULT_RESPONSE`);
  - отсутствие `operationId` (`MISSING_OPERATION_ID`, уровень info).
- Добавлена unified-схема конфигурации `UNIFIED_OPTIONS_v5` с миграцией с `v4` и значениями по умолчанию для новых полей.

### Изменено
- `OpenApiClient`: после логирования ошибки генерации ошибка пробрасывается дальше, чтобы программные вызовы и CI корректно фиксировали сбой.

### Тесты
- Добавлены unit-тесты для `validateOpenApiStrict` (strict-issues, «чистая» спецификация и `preIssues` из валидации парсера).
- Обновлены ожидания `migrateDataToLatestSchemaVersion` для последней unified-схемы `UNIFIED_OPTIONS_v5`.

## [2.1.0-beta.1] — 2026-03-02

### Добавлено
- Добавлены улучшения поддержки binary/Blob в сгенерированных клиентах:
  - схемы `format: binary` теперь маппятся в `Blob`;
  - опция запроса/ответа `responseType: 'blob'`;
  - runtime-обработка бинарных ответов для `fetch`, `xhr`, `node`, `axios`.
- Добавлены Blob-сценарии в тестовых спецификациях и snapshot’ах (`v3`, `v3_withDifferentRefs`).
- Добавлена команда `analyze-diff` для формирования diff‑отчетов между версиями OpenAPI.
- Добавлены опции history‑генерации: `useHistory` и `diffReport`.
- Добавлен `modelsMode` (`interfaces` | `classes`) для генерации `Raw/Dto` моделей в одном `models.ts`.
- Добавлены `BaseDto` и `dtoUtils` в сгенерированный `core` при `modelsMode=classes`.
- Добавлена поддержка раздела `miracles` в diff‑отчете и deprecated‑геттеров в DTO при подтвержденных rename.
- Добавлен авто‑коэрсинг в схемах валидации при смене типа (Zod/Joi/Yup/AJV).

### Изменено
- Улучшен парсинг ответов и разрешение ссылок:
  - для response `$ref` нормализуется контекст родительского файла перед разрешением вложенных ссылок;
  - усилена логика выбора content media type и парсинга кодов ответов.
- Обновлен поток загрузки OpenAPI-спецификаций: резолв идет по абсолютному пути без глобального `process.chdir(...)`.
- Добавлены секции конфигурации `models`, `analyze` и `miracles` в unified‑схему и шаблоны `init`.
- Обновлены README (EN/RU) и MIGRATION с описанием history/DTO‑возможностей.

### Исправлено
- Исправлены кейсы с неразрешимыми вложенными `$ref` внутри reference-ответов.
- Исправлен разбор кодов ответов операций для точных кодов и диапазонов (`2XX`).
- Исправлен edge-case генерации моделей, когда запись моделей могла завершаться преждевременно.

### Тесты
- Добавлено/обновлено unit-покрытие для:
  - парсинга кодов ответов и operation results;
  - выбора media type и Blob-маппингов.
- Обновлены snapshot-наборы для core/runtime/service генерации по v2/v3 фикстурам.

## [2.0.0] — 2026-02-23

### Добавлено
- Добавлена поддержка `customExecutorPath` в опциях генерации:
  - новый CLI/config-параметр `customExecutorPath`;
  - сгенерированный `createClient` может использовать пользовательский `createExecutorAdapter`.
- Добавлена runtime-точка расширения `executorFactory` в опциях сгенерированного `createClient`.
- Добавлен поток выполнения raw-ответов:
  - `RequestExecutor.requestRaw<TResponse>()`;
  - сгенерированные сервисные методы `*Raw(...)`;
  - core request-шаблоны теперь экспортируют `requestRaw(...)`.
- Добавлена generic-типизация тела ответа `ApiResult<TBody>`.
- Добавлено предупреждение о deprecated array-формате конфигурации (`LOGGER_MESSAGES.CONFIG.ARRAY_DEPRECATED`) в потоках generate/preview/валидации конфига.

### Изменено
- Обновлена валидация direct CLI-генерации в `generateOpenApiClient`:
  - удалена legacy Joi-валидация через `defaultOptions`;
  - добавлена Zod-валидация на базе `flatOptionsSchema`.
- Обновлён поток direct-генерации: `OpenAPI.generate(...)` вызывается только при успешной валидации.
- Улучшен текст ошибки в `generate` для fallback-сценария, когда нет валидных `--input/--output` и отсутствует доступный config-файл.
- Обновлены unified-схема V4 и типизация опций:
  - `customExecutorPath` добавлен в unified options schema;
  - получение latest unified schema переведено на `unifiedSchemaDefinitions`.
- Обновлены утилиты нормализации конфига для сохранения/продвижения `customExecutorPath` при конвертации legacy array/object форматов.
- Обновлена документация `README.md` и `README.rus.md` по `customExecutorPath` и использованию `executorFactory`.

### Удалено
- Удалён устаревший legacy-модуль валидации `src/common/defaultOptions.ts`.

### Исправлено
- Исправлен текст команды в предупреждении миграции `migrateDataToLatestSchemaVersion`: теперь указан `openapi-codegen-cli update-config`.
- Исправлена согласованность типизации request/core за счет распространения `ApiResult<T>` в request-шаблонах и контракте сгенерированного executor.

### Тесты
- Обновлены compatibility и utility тесты для покрытия миграции/нормализации `customExecutorPath`.

## [2.0.0-beta.13] — 2026-02-22

### Добавлено
- Добавлены структурированные отчеты для `preview-changes`:
  - `summary.json`;
  - `summary.md`;
  - `added-files.md`;
  - `removed-files.md`;
  - `modified-files.md`.
- Добавлена внутренняя документация по логике preview changes в `src/cli/previewChanges/PreviewChanges.md`.

### Изменено
- Переработан поток выполнения `preview-changes`:
  - унифицированы завершение и очистка через `try/catch/finally`;
  - сравнение файлов сделано детерминированным;
  - проверки существования файлов переведены на set-based подход после рекурсивного чтения директорий;
  - preview-директория генерации теперь переcоздаётся перед каждым запуском.
- Обновлено преобразование output-путей для preview-генерации: если путь выходит за пределы `generatedDir`, используется безопасный fallback через `basename`.
- В CLI включено `program.showSuggestionAfterError(false)`.
- Обновлен `example/openapi.config.json`: `axios` и расширенный набор опций генерации.
- Обновлена зависимость `commander` с `8.0.0` до `9.0.0`.
- В `.gitignore` добавлена директория `.ts-openapi-codegen-diff-changes`.

### Исправлено
- Исправлено накопление устаревших diff-артефактов: diff-директория очищается перед записью нового отчета.
- Исправлен жизненный цикл временной preview-директории: очистка теперь гарантированно выполняется в `finally`.
- Исправлено поведение `preview-changes` при отсутствии изменений: старые diff-отчеты удаляются.
- Исправлено преобразование output-путей для кейсов, когда `output` выходит за пределы `generatedDir`: добавлен fallback через `basename`.

## [2.0.0-beta.12] — 2026-02-16

### Изменено
- Обновлена логика подбора версии схемы в `determineBestMatchingSchemaVersion`:
  - в ранжирование кандидатов добавлена оценка неизвестных ключей через strict shadow-check;
  - стабилизирован tie-break для смешанных семейств схем (`OPTIONS`, `MULTI_OPTIONS`, `UNIFIED_OPTIONS`).
- Обновлён процесс миграции в `migrateDataToLatestSchemaVersion`: переходы теперь выполняются по графу миграций (`fromVersion -> toVersion`), а не по индексам в массиве схем.
- Синхронизированы имена unified-версий в `allMigrationPlans` с версиями схем (`UNIFIED_OPTIONS_v*`).
- Добавлены JSDoc-описания для внутренних типов/функций в модулях подбора версии и миграции схем.

### Исправлено
- Исправлено некорректное определение стартовой версии в смешанных наборах схем, где unified-схемы могли выбираться слишком рано.
- Исправлен обход цепочки миграций, который мог переходить в соседнее семейство схем при индексной итерации.
- Исправлены потенциальные runtime-ошибки из-за рассинхрона имён unified-версий в migration plan.

### Тесты
- Добавлен регрессионный тест выбора корректного пути миграции в mixed-наборе схем (`migrateDataToLatestSchemaVersion.test.ts`).

## [2.0.0-beta.11] — 2026-02-15

### Добавлено
- Добавлена опция `emptySchemaStrategy` со значениями: `keep`, `semantic`, `skip`.
- Добавлены отдельные поведенческие тесты стратегий пустых схем в `test/emptySchemaStrategy.test.ts`.

### Изменено
- Обновлены таблицы CLI/config-параметров в `README.md` и `README.rus.md`: добавлен `emptySchemaStrategy`.
- Разделены типы тестов по назначению:
  - `test/index.test.ts` оставлен для snapshot-регрессий общего поведения генератора;
  - `test/emptySchemaStrategy.test.ts` покрывает только поведение стратегий.

### Исправлено
- Исправлена генерация пустых схем для всех библиотек валидации: `zod`, `joi`, `yup`, `jsonschema`.
- Исправлены пути импортов в validation-шаблонах: теперь стабильно используются файлы `*Schema`.
- Исправлены шаблоны, дававшие невалидный код для пустых interface-схем (`joi`/`yup`) и ломающие форматирование.

## [2.0.0-beta.10] — 2026-02-13

### Добавлено
- Добавлены новые unit-тесты для `getRelativeModelPath`, `resolveRefPath`, `modelHelpers`, `serviceHelpers`, `postProcessModelImports`, `postProcessServiceImports` и `writeClientExecutor`.
- Добавлен snapshot-набор для `v3withAlias`, включая `core/executor`, `core/interceptors`, модели и сервисы.
- Добавлен новый сценарий в спецификацию `v3withAlias` (`/api/aliasMatrix`) для проверки alias между request/response моделями.

### Изменено
- Парсинг ссылок в OpenAPI v2/v3 (`getType`) переведён на `getRelativeModelPath` для единообразной нормализации путей к моделям.
- Обновлён `getOpenApiSpec`: на время `parser.resolve` рабочая директория переключается в директорию входной спецификации и затем восстанавливается.
- Обновлены `postProcessModelImports` и `postProcessServiceImports`:
  - self-import в моделях теперь отфильтровывается по реальному пути, а не только по имени;
  - одноимённые импорты в сервисах больше не удаляются только из-за совпадения имени с сервисом.
- В `writeClientExecutor` добавлена дедупликация сервисов по имени перед генерацией `createClient`.
- В шаблонах `indexFull`/`indexSimple` (и compiled-версиях) экспорт `createClient` теперь генерируется только при включённом `core`.
- Обновлены шаблоны `ApiError` и `catchErrors`: `ApiError` принимает структурированные параметры (`status`, `message`, `request`, и опционально `body`/`headers`) вместо передачи `ApiResult`.

### Исправлено
- Исправлено формирование путей импортов моделей при `./` (добавлен отсутствующий `/`).
- Исправлена прокладка alias для дублирующихся импортов в вложенные структуры (`link`, `properties`, `enums`) и сервисные типы.
- Исправлено разрешение внешних `$ref`: убрана агрессивная дедупликация сегментов пути, которая ломала валидные пути с повторяющимися директориями.
- Исправлены snapshot’ы и generated-типизация для кейсов с конфликтующими alias и словарными параметрами (`Record<string, string> | null`).

### Удалено
- Удалена утилита `advancedDeduplicatePath` как источник некорректной нормализации путей.


## [2.0.0-beta.9] — 2026-02-07

### Добавлено
- Добавлены унифицированные версионные схемы с базой и refinements для single/multi конфигураций.
- Добавлены Zod-хелперы в `common/Validation` для валидации CLI-опций.
- Добавлена схема CLI-команды `previewChanges`.

### Изменено
- CLI-команды (`generate`, `check-openapi-config`, `update-openapi-config`, `init-openapi-config`, `preview-changes`) переведены на единую Zod-валидацию с более понятными ошибками.
- Обновлены дефолтные директории для `preview-changes` на скрытые рабочие каталоги:
  - `.ts-openapi-codegen-preview-changes`;
  - `.ts-openapi-codegen-diff-changes`.
- Обновлены утилиты миграции и схем для использования единого слоя версионных схем.
- Обновлены шаблон экспорта сервисов и partial экспорта composition.

### Удалено
- Удалены legacy-модуль валидации CLI и устаревшие schema-утилиты.

### Исправлено
- Исправлена канонизация относительных `$ref` в `Context`.
- Исправлена прокладка alias для вложенных типов в сервисах и alias для enum в композициях.

### Тесты
- Обновлены snapshot-тесты сервисов для OpenAPI v2 и v3.

## [2.0.0-beta.8] — 2026-01-28

### Добавлено
- Добавлена поддержка interceptors в клиентском core:
  - `withInterceptors`;
  - `interceptors`;
  - `apiErrorInterceptor`.
- Добавлена новая структура executor’а:
  - выделена директория `core/executor`;
  - добавлен `requestExecutor`.
- Добавлены snapshot-тесты для executor’а и interceptors для OpenAPI v2 и v3.

### Изменено
- Переработана архитектура executor’а:
  - шаблоны `createExecutorAdapter` и `request-executor` перенесены в `core/executor`;
  - обновлена логика генерации и регистрации шаблонов.
- Обновлены core-шаблоны клиента:
  - `ApiError`;
  - `CancelablePromise`;
  - `HttpStatusCode`.
- Обновлена логика генерации клиента:
  - `WriteClient`;
  - `writeClientCore`.
- Обновлены шаблоны и генерация index-файлов (`indexCore`, `indexFull`).
- Обновлены шаблоны экспорта клиента и сервисов.
- Обновлена документация (`README.md`, `README.rus.md`).

### Удалено
- Полностью удалён legacy request executor и связанные snapshot-тесты.

### Тесты
- Существенно обновлены snapshot-тесты генерации клиента для OpenAPI v2 и v3.
- Добавлены snapshot-тесты для interceptor’ов и нового executor’а.

## [2.0.0-beta.7] — 2026-01-22

### Добавлено
- Добавлены новые snapshot-тесты моделей для OpenAPI v2 и v3, включая:
  - циклические ссылки;
  - вложенные и расширяемые схемы;
  - enum-типы и коллекции.
- Добавлен расширенный набор тестов для сценариев с различными стратегиями ссылок (`v3_withDifferentRefs`).
- Добавлена новая OpenAPI-спецификация для тестирования альтернативной структуры `$ref`.

### Изменено
- Переработана логика парсинга моделей и типов для OpenAPI v2 и v3:
  - обновлены  `getModels` и `getType`;
  - улучшена обработка сложных и вложенных схем.
- Обновлён `Context` генерации клиента.
- Обновлена логика загрузки и обработки OpenAPI-спецификаций (`getOpenApiSpec`).
- Улучшена обработка неймспейсов (`stripNamespace`).
- Обновлены утилиты работы с файловой системой.
- Обновлены типы и логика инициализации OpenAPI-конфига в CLI.
- Обновлены зависимости и конфигурация проекта.

### Удалено
- Полностью удалена устаревшая логика работы с `$ref`:
  - удалены вспомогательные типы, enum’ы и утилиты резолва ссылок;
  - удалены связанные unit-тесты.
- Удалены устаревшие snapshot-тесты схем и legacy request adapter.

### Тесты
- Существенно расширено покрытие snapshot-тестами генерации:
  - моделей; 
  - сервисов;
  - core-артефактов клиента.
- Обновлены существующие snapshot-тесты для OpenAPI v2 и v3.

## [2.0.0-beta.6] — 2026-01-22

### Добавлено
- В централизованный модуль "fileSystemHelpers" добавлена функция "isSameFilePath" для лучшего сравнения путей к файлам
- Добавлен помощник camelCase для обработки шаблонов Handlebars
- Создано новое поколение адаптеров executor (createExecutorAdapter.hbs), заменяющее устаревший адаптер запросов
- Экспортирована модель типов шаблонов для улучшения регистрации типов

### Изменено
- Тип "Шаблоны" перенесен из основного модуля в специальный файл "src/core/types/base/Templates.model.ts" для лучшей организации
- Функция `resolveRefToImportPath` переработана для более надежной обработки ссылок на внешние файлы
- Упрощена логика регистрации шаблона Handlebars
- Улучшен шаблон параметров обслуживания (`serviceOption.hbs`), улучшена обработка параметров.
- Индексные файлы переработаны для более четкой структуры экспорта (`indexCore.hbs`, `indexFull.hbs`, `indexSimple.hbs`)

### Удалено
- Устаревший адаптер запросов (`legacy-request-adapter.hbs`) удален в пользу нового подхода к адаптеру executor

### Исправлено
- В `resolveRefToImportPath` добавлена проверка самостоятельных ссылок для правильного разрешения ссылок на внешние файлы
- Улучшена обработка крайних случаев при компиляции шаблона

### Тесты
- Обновлены модульные тесты для функции `resolveRefToImportPath` с новыми тестовыми примерами
- Обновлены тестовые файлы моментальных снимков для спецификаций OpenAPI v2 и v3
- Обновлен набор тестов WriteClient с тестовыми примерами адаптера executor

## [2.0.0-beta.5] - 2026-01-21

### Добавлено
- Новая CLI-команда init для инициализации конфигурации OpenAPI.
- Пошаговый процесс инициализации:
  - поиск и валидация OpenAPI-спецификаций;
  - генерация конфигурационного файла;
  - создание пользовательского request или request executor.
- Утилиты для:
  - поиска файлов спецификаций;
  - валидации отдельных и множественных спецификаций;
  - генерации и записи конфигурации;
  - регистрации Handlebars-шаблонов для CLI.
- Новые CLI-шаблоны и их скомпилированные версии.

### Изменено
- Обновлён CLI entrypoint и схемы параметров команды init.
- Переработана логика инициализации OpenAPI-конфига:
  - логика разделена на независимые, переиспользуемые модули.
- Обновлены общие константы и утилиты работы с файловой системой.
- Улучшено разрешение $ref → import path в core-логике генерации.
- Обновлён шаблон openApiConfig.

### Удалено
- Удалена устаревшая команда инициализации runInitOpenapiConfig.

### Исправлено
- Исправлено разрешение относительных ссылок $ref при работе с внешними файлами и вложенными директориями.
- Исправлены кейсы, когда parentFilePath указывает на директорию.

## [2.0.0-beta.4] - 2026-01-18

### Добавлено
- Добавлена новая CLI-команда previewChanges, позволяющая предварительно просматривать изменения в сгенерированном коде без записи на диск.
- Реализован набор утилит для сравнения файлов и директорий, форматирования diff и корректного обновления путей вывода.
- Добавлена документация для команды previewChanges.

### Изменено
-Проведён рефакторинг генерации OpenAPI-клиента:
- Логика генерации вынесена и переименована для большей ясности и расширяемости.
- Обновлены схемы конфигурации (UnifiedOptionsSchema v1 и v2).
- Улучшены утилиты работы с файловой системой.
- Обновлены Handlebars-шаблоны клиента и соответствующий скомпилированный код.
- Обновлён request executor и генерация параметров и опций сервисов.

### Тесты
- Обновлены unit-тесты и snapshot-тесты для OpenAPI v2 и v3.
- Актуализированы снапшоты сервисов, типов, параметров, multipart-запросов и обработки ответов.
- Удалены устаревшие снапшоты.

### Прочее
- Обновлены зависимости (package.json, package-lock.json).
- Удалена устаревшая документация (Note.md).

## [2.0.0-beta.3] - 2026-01-08

### Добавлено
- Добавлена система валидации на основе Zod для CLI опций и файлов конфигурации, обеспечивающая лучшую типобезопасность и валидацию.
- Добавлены модули схем CLI (`src/cli/schemas/`) для валидации команд:
  - `base.ts` - базовая схема CLI опций
  - `checkConfig.ts` - схема команды check-config
  - `generate.ts` - схема команды generate с условной валидацией
  - `init.ts` - схема команды init
  - `updateConfig.ts` - схема команды update-config
- Добавлены модули схем CLI (`src/common/schemas/`) для валидации команд:
  - `configSchemas.ts` - унифицированные схемы файлов конфигурации (TRawOptions, TFlatOptions, TItemConfig)
- Добавлен модуль валидации (`src/cli/validation/`) с утилитами форматирования ошибок:
  - `validateCLIOptions.ts` - функции валидации на основе Zod с форматированными сообщениями об ошибках
  - `errorFormatter.ts` - форматирование сообщений об ошибках для CLI

### Изменено
- Рефакторинг `TRawOptions.ts`: реэкспорт типов из Zod схем, обеспечивающий согласованность типов и правил валидации.
- Обновлён `runGenerateOpenApi.ts` для использования Zod валидации CLI опций перед обработкой, улучшая обнаружение ошибок и пользовательский опыт.
- Улучшена логика валидации: добавлены условные проверки (например, совместимость `excludeCoreServiceFiles` и `request`, обязательность `input`/`output` при отсутствии файла конфигурации).

## [2.0.0-beta.2] - 2026-01-07

### Добавлено
- Добавлен параметр `validationLibrary` для поддержки нескольких библиотек валидации при генерации схем: `none`, `zod`, `joi`, `yup`, `jsonschema`.
- Добавлены Handlebars шаблоны для генерации схем валидации:
  - Схемы валидации Zod (`zod/exportSchema.hbs` и партиалы)
  - Схемы валидации Yup (`yup/exportSchema.hbs` и партиалы)
  - Схемы валидации Joi (`joi/exportSchema.hbs` и партиалы)
  - Схемы валидации JSON Schema (`jsonschema/exportSchema.hbs` и партиалы)
- Добавлен enum `ValidationLibrary` для определения поддерживаемых библиотек валидации.
- Добавлен план миграции из `UNIFIED_v1` в `UNIFIED_v2` схему, который мигрирует `includeSchemasFiles` в `validationLibrary`.

### Изменено
- **BREAKING**: Заменён параметр `includeSchemasFiles` (boolean) на параметр `validationLibrary` (enum) для более гибкой генерации схем валидации.
- Обновлена логика генерации схем для поддержки нескольких библиотек валидации с библиотеко-специфичными шаблонами.
- Обновлён `writeClientSchemas` для использования библиотеко-специфичных шаблонов на основе выбранной библиотеки.

### Удалено
- **BREAKING**: Удалён параметр `includeSchemasFiles` (заменён на `validationLibrary`).

### Примечания по миграции
- Параметр `includeSchemasFiles` автоматически мигрируется в `validationLibrary`:
  - `includeSchemasFiles: false` → `validationLibrary: 'none'`
  - `includeSchemasFiles: true` → `validationLibrary: undefined` (будет использовано значение по умолчанию, обычно `'none'`)
- Для генерации схем валидации установите `validationLibrary` в одно из значений: `'zod'`, `'joi'`, `'yup'`, или `'jsonschema'`.
- Значение по умолчанию: `'none'` (схемы валидации не генерируются).

## [2.0.0-beta.1] - 2026-01-06

### Добавлено
- Добавлена core-абстракция `RequestExecutor` / `RequestConfig` и Handlebars-шаблон для генерации типобезопасного интерфейса исполнителя запросов в слое core.
- Добавлен core-шаблон `legacy-request-adapter` и сгенерированный файл, адаптирующий существующий рантайм `request(options: ApiRequestOptions, config: OpenAPI)` к новому интерфейсу `RequestExecutor`, сохраняя совместимость с текущими реализациями HTTP-клиентов.

### Изменено
- **BREAKING**: Обновлён шаблон генерации сервисов: теперь генерируются тонкие классы-сервисы поверх `RequestExecutor` вместо прямых вызовов core-функции `request`; методы сервисов принимают опциональные транспортные опции и делегируют выполнение запросов внедрённому исполнителю.
- Обновлена регистрация Handlebars-шаблонов и логика `writeClientCore` для генерации новых core-файлов (`request-executor.ts`, `legacy-request-adapter.ts`) вместе с существующими файлами рантайма `ApiRequestOptions`, `OpenAPI` и `request`.
- Скорректирован шаблон `serviceOption` для конструирования объектов `RequestConfig`, потребляемых новой абстракцией `RequestExecutor`.

## [2.0.0-beta.0] - 2025-12-28

### Добавлено
- Добавлен новый класс `OpenApiClient` (`src/core/OpenApiClient.ts`) как основная точка входа для генерации кода, обеспечивающий лучшее разделение ответственности и улучшенную обработку ошибок.
- Добавлен централизованный модуль сообщений логгера (`src/common/LoggerMessages.ts`) для всех текстовых констант логирования, обеспечивающий централизованное управление и поддержку интернационализации.
- Добавлена система unified options schema (`UnifiedOptionsVersioned`), поддерживающая миграцию из устаревших схем `OPTIONS` и `MULTI_OPTIONS` в унифицированный формат.
- Добавлены модули `AllVersionedSchemas` и `AllMigrationPlans` для поддержки межсхемных миграций (из OPTIONS/MULTI_OPTIONS в UNIFIED_OPTIONS).
- Добавлена утилита `getRelativeModelImportPath` для улучшенного расчёта относительных путей импорта моделей.
- Добавлены утилиты `createDefaultFieldsMigration` и `createTrivialMigration` для упрощения создания планов миграции.
- Добавлены определения типов TypeScript для пакетов `mkdirp` и `rimraf` в `src/typings/`.

### Изменено
- **BREAKING**: Рефакторинг структуры опций: переименован `Options.ts` в `TRawOptions.ts` и введена новая система типов с `TRawOptions`, `TFlatOptions` и `TStrictFlatOptions` для лучшей типобезопасности.
- **BREAKING**: Обновлён core API: функция `generate()` теперь использует `OpenApiClient` внутри, обеспечивая улучшенную обработку ошибок и возможности логирования.
- Рефакторинг потока генерации кода: логика генерации перенесена из прямых вызовов функций в методы класса `OpenApiClient` для лучшей поддерживаемости.
- Улучшена система миграции схем: улучшены планы миграции для схем `OPTIONS` и `MULTI_OPTIONS` с лучшей обработкой значений по умолчанию.
- Обновлены все парсеры (v2 и v3) для работы с новой архитектурой `OpenApiClient`.
- Улучшена интеграция логгера: все сообщения логирования теперь используют централизованные константы `LOGGER_MESSAGES`.
- Обновлены классы `WriteClient` и `Context` для работы с новой архитектурой.

### Удалено
- **BREAKING**: Удалена утилита `getModelNameWithPrefix` (функциональность интегрирована в model helpers).
- **BREAKING**: Удалена утилита `normalizeString` (функциональность перенесена в другие хелперы).
- **BREAKING**: Удалена утилита `prepareOptions` (подготовка опций теперь обрабатывается `OpenApiClient`).
- Удалён файл конфигурации `knip.json`.
- Удалён устаревший snapshot-тест `test/__snapshots__/v2/services/V2Service.ts.snap`.

### Исправлено
- Исправлен расчёт относительных путей импорта для моделей в сложных вложенных сценариях.
- Улучшена обработка ошибок в процессе генерации кода с лучшим логированием и сообщениями об ошибках.
- Повышена надёжность миграции схем с улучшенной валидацией и отчётами об ошибках.

### Примечания по миграции
- Если вы используете функцию `generate()` напрямую, API остаётся совместимым, но внутренняя реализация изменилась.
- Файлы конфигурации, использующие старые схемы `OPTIONS` или `MULTI_OPTIONS`, будут автоматически мигрированы в формат `UNIFIED_OPTIONS`.
- Пользовательский код, использующий удалённые утилиты (`getModelNameWithPrefix`, `normalizeString`, `prepareOptions`), должен быть обновлён для использования новой архитектуры.

## [1.0.0] - 2025-12-27

### Изменено
- Улучшен метод `UpdateNotifier.checkAndNotify()` с улучшенной логикой кэширования: теперь сначала проверяет кэшированную информацию об обновлениях перед выполнением сетевых запросов, обеспечивая более быстрый отклик при последующих запусках.
- Улучшена обработка ошибок в CLI: улучшена обработка ошибок парсинга для неизвестных опций команд с корректным логированием ошибок.
- Обновлены все CLI команды для использования асинхронного метода `checkAndNotify()` вместо синхронной версии для лучшей надёжности и неблокирующего поведения.
- Отрефакторено управление жизненным циклом логгера: удалён вызов `shutdownLogger()` из `UpdateNotifier` - жизненный цикл логгера теперь управляется на уровне приложения для лучшего контроля.

### Устарело
- Метод `UpdateNotifier.checkAndNotifySync()` теперь помечен как устаревший. Используйте `checkAndNotify()` вместо него.

### Исправлено
- Исправлено кэширование уведомлений об обновлениях для предотвращения дублирующих уведомлений и корректной очистки кэша после показа обновлений.
- Улучшена обработка ошибок в процессе проверки обновлений, чтобы предотвратить сбои, нарушающие основной рабочий процесс CLI.

## [1.0.0-beta.14] - 2025-12-23

### Добавлено
- Добавлен хелпер `getModelNameWithPrefix` для централизованного формирования имён моделей с префиксами для интерфейсов, enum и типов.
- Добавлена утилита `normalizeString` и интеграция этой нормализации в регистрацию Handlebars-хелперов для выравнивания имён моделей и схем в шаблонах.
- Добавлен шебанг `#!/usr/bin/env node` в основной entrypoint CLI, чтобы генератор можно было вызывать напрямую как shell-команду.

### Изменено
- Обновлены парсеры OpenAPI v2/v3 (`Parser`, `getModels`, `getType`) и базовые экспорты (`Context`, `index`) для использования новых утилит вычисления имён моделей и путей.
- Адаптирована функция `getRelativeModelPath` под обновлённые правила наименования, чтобы согласовать пути моделей, схем и импортов на разных платформах.
- Обновлена инициализация CLI в `src/core/index.ts`: добавлен вызов `program.exitOverride()` для корректной передачи кодов выхода во внешние инструменты.
- Обновлён `package.json` для экспонирования бинарника `openapi-codegen-cli`, публикации деклараций типов из `dist/index.d.ts` и включения директории `example/` в поставку пакета.

### Исправлено
- Исправлена генерация относительных путей импортов для моделей и их схем в сложных сценариях вложенности и перекрёстных ссылок между файлами для OpenAPI v2 и v3.
- Актуализированы snapshot-тесты v2/v3 для моделей и схем в соответствии с исправленными именами моделей и путями импортов.

### Удалено
- Удалена устаревшая утилита `getRelativeModelImportPath` и связанные с ней unit-тесты.
- Удалены устаревшие ambient-типизации для `mkdirp` и `rimraf`; актуальные кастомные типы консолидированы в директории `types/`.

## [1.0.0-beta.13] - 2025-12-18

### Добавлено
- Добавлен сбор метрик покрытия кода (coverage) во время запуска unit тестов
- Добавлен централизованный модуль утилит файловой системы (`src/common/utils/fileSystemHelpers.ts`) с унифицированным API для файловых операций:
  - Промисфицированные версии функций Node.js fs (readFile, writeFile, copyFile, exists)
  - Функции рекурсивного создания (`mkdir`) и удаления (`rmdir`) директорий
  - Утилиты проверки путей (`isDirectory`, `isPathToFile`)
- Улучшена функция `resolveRefToImportPath` для обработки всех типов ref ссылок на файлы спецификации:
  - Улучшена обработка HTTP URL, локальных фрагментов, фрагментов внешних файлов, внешних файлов и абсолютных путей
  - Улучшено разрешение путей для внешних файлов и директорий
  - Расширена поддержка сложных сценариев ссылок

### Изменено
- Рефакторинг утилит файловой системы: объединены разрозненные операции файловой системы в централизованный модуль `fileSystemHelpers`
- Обновлены все утилиты записи клиента (`writeClientCore`, `writeClientModels`, `writeClientServices`, `writeClientSchemas`, `writeClientFullIndex`, `writeClientSimpleIndex`) для использования нового API `fileSystemHelpers`
- Обновлена функция `resolveRefToImportPath` для использования `fileSystemHelpers.isDirectory` и `fileSystemHelpers.isPathToFile` для лучшего определения путей
- Обновлены `getOpenApiSpec` и `appendUniqueLinesToFile` для использования новых утилит файловой системы
- Обновлены CLI утилиты (`updateExistingConfigFile`, `writeExampleConfigFile`, `runInitOpenapiConfig`) для использования централизованных утилит файловой системы
- Обновлены все тестовые файлы для использования нового модуля `fileSystemHelpers` вместо устаревших утилит

### Удалено
- Удалён устаревший файл `src/core/utils/fileSystem.ts` (функциональность перенесена в `fileSystemHelpers`)
- Удалён устаревший файл `src/core/utils/isDirectory.ts` (функциональность перенесена в `fileSystemHelpers`)

### Исправлено
- Исправлены проблемы с разрешением путей в `resolveRefToImportPath` при работе с внешними файлами и директориями
- Улучшена обработка ошибок в файловых операциях с лучшей нормализацией путей

## [1.0.0-beta.12] - 2025-12-16

### Добавлено
- Добавлен новый CLI модуль `checkAndUpdateConfig` с комплексной валидацией и миграцией конфигурации:
  - `checkConfig.ts` - основная логика проверки конфигурации
  - `updateConfig.ts` - механизм обновления файла конфигурации
  - `types.ts` - TypeScript типы для операций с конфигурацией
  - `constants.ts` - константы, связанные с конфигурацией
  - Утилиты: `generateConfigExample`, `prepareConfigData`, `removeDefaultConfigValues`, `rewriteConfigFile`, `selectConfigAction`, `updateExistingConfigFile`, `validateAndMigrateConfigData`, `writeConfigFile`, `writeExampleConfigFile`
- Добавлены интерактивные диалоги CLI:
  - `confirmDialog.ts` - диалоги подтверждения да/нет
  - `selectDialog.ts` - диалоги выбора для пользователя
  - `types.ts` и `constants.ts` для интерактивного модуля
- Добавлены утилиты `getCurrentErrorMessage` и `getKeyByMapValue` в VersionedSchema Utils

### Изменено
- Рефакторинг структуры CLI: логика `chekOpenApiConfig` интегрирована в новый модуль `checkAndUpdateConfig`
- Реорганизованы утилиты common: файлы тестов и функции утилит перемещены из `src/common/__tests__/` и `src/core/utils/` в `src/common/utils/__tests__/` и `src/common/utils/`
- Обновлены пути импортов во всех файлах тестов в соответствии с новым расположением утилит
- Улучшены `runGenerateOpenApi.ts` с лучшей обработкой ошибок и логированием

### Исправлено
- Обновлены импорты тестов во всех утилитах core для ссылки на перемещённые файлы
- Улучшена разрешение путей в тестах parser core (v2 и v3)
- Исправлены ожидания тестов для сопоставления версий схемы и разрешения типов

### Удалено
- Удалён устаревший файл `src/cli/chekOpenApiConfig/chekOpenApiConfig.ts`

### Обновлено
- Обновлены зависимости в package.json
- Обновлены файлы тестов для перемещённых утилит (см. src/core/utils/__tests__ и src/common/utils/__tests__)
- Улучшены тесты WriteClient с дополнительными проверками

## [1.0.0-beta.11] - 2025-12-12

### Добавлено
- Добавлены регулярные выражения для обработки разных ситуаций в путях к файлам (для обработки путей шаблонов).
- Добавлена вспомогательная функция для обработки пути в шаблонах - `normalizePath`.
- Добавлена вспомогательная функция для объединения частей пути в шаблонах - `joinPath`.
- Добавлена вспомогательная функция для выявления использования зарезервированных системой наименований - `containsSystemName`.

### Изменено
- Использование вспомогательных функций из пакета `path` заменено на улучшенные варианты из `pathHelpers`.
- Вспомогательные функции `resolveHelper` перенесены в директорию `common/utils/`

## [1.0.0-beta.10] - 2025-12-11

### Добавлено
- Добавлена обработка путей для внешних файлов в функцию `resolveRefToImportPath`

### Изменено
- Времено отключены unit тесты для функции `getType`.

## [1.0.0-beta.9] - 2025-12-10

### Изменено
- Вместо функции `get` из npm пакета `lodash-es` используется функция `safeHasOwn`
- Функции из файла `common/Utils.ts` вынесены в отдельные файлы с соответствующим наименованием в директорию `common/utils/`

### Удалено
- Удалёно использование npm пакета `lodash-es`

## [1.0.0-beta.8] - 2025-12-06

### Добавлено
- Добавлена команда CLI инструмента `init-openapi-config`. Формирует шаблон файла конфигурации для запуска генерации кода по файлам спецификаций openapi.
- Добавлен параметр для указания файла конфигурации (по умолчанию: `openapi.config.json`) в команду CLI инструмента `check-openapi-config`.
- Добавлен параметр для указания файла конфигурации (по умолчанию: `openapi.config.json`) в команду CLI инструмента `generate`.
- Добавлен файл шаблона (hbs) для формирования файла конфигурации (по умолчанию: `openapi.config.json`).

### Изменено
- Изменено расположение шаблонов (hbs файлы) для генерации кода по спецификациям openapi.

## [1.0.0-beta.7] - 2025-11-30

### Добавлено
- Обновлены примеры CLI и схема конфигурации (example/openapi.config.json) и README.md в соответствии с новыми параметрами CLI.
- Добавлены и обновлены тесты и утилиты, связанные с поведением WriteClient.

### Изменено
- Интерфейс CLI — обновлён набор параметров командной строки и логика валидации:
  - Переименованы и реорганизованы несколько флагов и опций в src/cli/index.ts и src/cli/utils.ts.
  - Обновлена обработка опций и код миграции в src/common/VersionedSchema/* и src/common/Options.ts для поддержки новой формы опций.
- Рефакторинг WriteClient:
  - Переработаны внутренности WriteClient (src/core/WriteClient.ts) и связанные хелперы (src/core/utils/writeClient*.ts) для более надёжной работы ввода/вывода, обработки ошибок и более чёткого разделения ответственности.
  - Адаптированы тесты: src/core/__tests__/WriteClient.test.ts и несколько юнит-тестов writeClient в src/core/utils/__tests__.
- Обновлены версии схем опций и планы миграций (src/common/VersionedSchema/*) для поддержки новых форматов конфигурации.

### Исправлено
- Генерация путей/импортов в Parser.getType (v3):
  - Не добавлять префикс "./" к путям, которые уже начинаются с "." (например "../...") или "/" (абсолютные).
  - Не добавлять запись об импорте, если разрешённый путь пустой.
  - Сохранено корректное поведение при переходах по каталогам и безопасных откатах при разрешении parentRef.
  - Изменения внесены в src/core/api/v3/parser/getType.ts (и при необходимости — в v2).
- Утилиты:
  - Исправлены и стабилизированы хелперы для разрешения путей: resolveRefToImportPath, getAbsolutePath и связанные тесты.
  - Скорректовано поведение getGatheringRefs и соответствующие ожидания в тестах.
- Тесты:
  - Обновлены многие unit-тесты для соответствия исправленному поведению путей и импортов (см. src/core/api/**/__tests__ и src/core/utils/__tests__).

### Обновлено
- Обновлены unit-тесты по всему проекту, чтобы согласовать их с изменённой логикой разрешения путей, поведением WriteClient и параметрами CLI.
- Обновлена документация и примеры (README, example/).

### Примечания
- Изменения в основном внутренние и касаются тестов/CLI. Публичный API генерируемых клиентов остаётся совместимым, однако конфигурация CLI/опции изменились — рекомендуется ознакомиться с примерами и планом миграции.

## [1.0.0-beta.6] - 2025-08-22

### Добавлено
- Добавлена команда для проверки файла конфигурации;
- Добавлен механизм проверки и уведомления о завершениях;

### Исправлено
- Рефакторинг: улучшена логика обработки сгенерированных данных и записи файлов на диск;
- Исправлен шаблон "IsReadOnly": ранее свойство с атрибутом readonly генерировалось неправильно — добавлен переход на новую строку.

## [1.0.0-beta.5] - 2025-08-09

### Добавлено
- Добавлена функция упрощённой сортировки аргументов для сервисных функций. Упрощённая стратегия похожа на используемую в версии 0.2.3 OpenAPI генератора;
- Добавлена функция расширённой сортировки аргументов сервисных функций;
- Добавлен флаг выбора стратегии сортировки аргументов в CLI инструменты;

### Обновлено
- Обновлено описание в README.

## [1.0.0-beta.4] - 2025-08-02

### Добавлено
- Добавлен механизм сопоставления входного набора параметров со списком недопустимых значений;
- Добавлено определение наиболее подходящей версии схемы;
- Добавлены unit-тесты для новых функций;

### Обновлено
- Обновлена функция для сбора уникальных ключей из массива схем валидации параметров.

## [1.0.0-beta.3] - 2025-07-24

### Добавлено
- Добавлен логгер с использованием npm-пакета winston;
- Добавлена функция преобразования массива опций в модель multiple option;
- Добавлено заполнение Joi схемы для набора опций и проверка значений по умолчанию;
- Добавлен подсчёт времени, затраченного на генерацию кода, с выводом в терминал;

### Исправлено
- Исправлен план миграции для multiple options;
- Исправлены unit-тесты для миграции наборов опций;

## [1.0.0-beta.2] - 2025-07-22

### Добавлено
- Механизм сопоставления разных версий наборов параметров генератора для обеспечения обратной совместимости;
- Механизм обнаружения опечаток при использовании опций генератора через CLI или файл конфигурации;
- Проверка CLI опций инструмента на наличие значений по умолчанию для дальнейших сценариев действий;
- Утилита для обработки служебных слов в именах (шаблоны);

### Обновлено
- Модели наборов опций генератора для запуска генерации были изменены;
- Код CLI инструмента перемещён в каталог cli, внесены правки в логику перед генерацией;
- Дублирующие участки кода объединены;

## [1.0.0-beta.1] - 2025-06-27

### Добавлено
- Добавлены snapshot unit-тесты;

## [1.0.0-beta.0] - 2025-06-12

### Добавлено
- Добавлено использование встроенных в Node.js тестов (unit-tests);

### Удалено
- Удалены разделы "samples" и "site";
- Удалён Jest;

### Обновлено
- Изменена структура папок проекта;
- Файлы шаблонов (hbs) проходят предварительную компиляцию перед использованием;
- Убран Rollup, сборка основана на tsc;
- Изменены настройки GitHub workflows (CI, Deploy);
- Внесены правки в настройки ESLint для улучшения чистоты кода;
- Повышена версия TypeScript;
- Повышена версия Node.js;

## [0.5.1] - 2025-05-15

### Исправлено
- Исправлено содержимое шаблона для генерации файла с кодом сервиса.
- Исправлён путь генерации файлов в unit-тесте (src/index.spec.ts).

## [0.5.1-rc.3] - 2025-05-15

### Добавлено
- Добавлено форматирование hbs шаблонов с помощью prettier

### Исправлено
- Исправлена кроссплатформенная ошибка при вычислении относительных путей

## [0.5.1-rc.2] - 2025-04-08

### Обновлено
- Обновлён механизм вычисления конечного пути: core, models, services, schemas
- Обновлены тесты в соответствии с внесёнными изменениями
- Обновлены примеры кастомных опций для request

### Исправлено
- Исправлен механизм вычисления относительного пути для импорта модели
- Исправлены сломанные тесты

## [0.5.1-rc.1] - 2025-01-21

### Добавлено
- Добавлен тест для функции getAbsolutePath
- Добавлен тест для функции getGatheringRefs

### Исправлено
- Исправлена ошибка при генерации моделей по спецификации, когда схема ссылалась на схему в другом файле, а схема из этого файла ссылалась на схему внутри того же файла.

### Обновлено
- Функция gatheringRefs вынесена в отдельный файл

## [0.5.0-beta.0] - 2024-08-01

### Добавлено
- Добавлена поддержка formData в V3

### Обновлено
- Обновлён тест (test/index.spec.ts) на TypeScript

## [0.4.0-beta.0] - 2023-11-12

### Обновлено
- Обновлены тесты на TypeScript;
- Обновлён расчёт финального пути для сервиса;
- Обновлены файлы запросов;
- Обновлена функция получения URL запроса;
- Обновлён шаблон генерации сервиса.

### Добавлено
- Добавлена возможность указывать собственную конфигурацию OpenApi для запросов.

## [0.3.1-rc.1] - 2023-10-18

### Исправлено
- Исправлена нормализация относительного пути при вычислении относительного пути модели.
- Исправлен механизм расчёта нужного количества переходов вверх по директориям.
- Исправлено значение разделителя пути при формировании относительного пути.

## [0.3.1-rc.0] - 2023-10-12

### Исправлено
- Исправлено преобразование строк в массив строк внутри функции calculateRelationPath (входные параметры).
- Исправлена типизация опций генератора, используемых в функции generate.
- Исправлено использование функции получения относительного пути модели.
- Исправлена логика функции getType для версии 2.
- Исправлена установка префикса для интерфейса (interfacePrefix).
- Исправлена установка префикса для enum (enumPrefix).
- Исправлена установка префикса для type (typePrefix).

### Обновлено
- Обновлён unit-тест для функции getType.
- Обновлён класс Parser для указания версии 2.

### Удалено
- Удалены все неиспользуемые импорты и утилиты.

## [0.3.1-beta.3] - 2023-07-14

### Исправлено
- Исправлена генерация относительных путей импортов и относительного пути модели при генерации на Windows.

### Изменено
- Разделение функционала (OpenAPI) namespace из значений объединено в одну функцию.
- Модифицирована функция соответствия типов под базовые типы Typescript/Javascript — функционал объединён.

### Пропущено
- Пропущена проверка типа getType. Требуется переписать метод по аналогии с getType v3

## [0.3.1-beta.2] - 2023-05-24

### Исправлено
- Удалена функция preProcessWriteModel
- Небольшой рефакторинг кода генерации моделей и схем
- При формировании относительного пути учитывается ситуация, когда корневой каталог не задан
- Формирование относительного пути модели и импорта модели перенесено в функцию getModels

## [0.3.1-beta.1] - 2023-05-15

### Добавлено
- Добавлен unit-тест для функции getRelativeModelImportPath
- Добавлен unit-тест для функции getRelativeModelImportPath

### Исправлено
- Исправлена функция расчёта относительного пути для импорта модели. Теперь учитывается неверное значение параметра относительного пути к модели.

## [0.3.1] - 2023-05-11

### Исправлено
- Исправлен механизм расчёта относительного пути для модели, импорта модели и схемы модели.

## [0.3.0] - 2023-05-11

### Добавлено
- Добавлена опция useCancelableRequest: использование обёртки CancelablePromise для запросов

### Исправлено
- Добавлены отсутствующие параметры в тестах

## [0.2.9] - 2023-04-03

- Обновлён пакет json-schema

## [0.2.8] - 2022-10-19

### Исправлено
- Добавлена функция, проверяющая переход на каталог уровня выше и нормализующая путь.

## [0.2.7] - 2022-10-01

### Добавлено
- Добавлена концепция cancelable

### Исправлено
- Исправлен некорректный тип ошибки в функции catchErrors
- Исправлена версия node в CI
- Исправлены зависимости

## [0.2.6] - 2022-09-18

### Добавлено
- Пример проекта

### Исправлено
- Исправлен некорректный тип клиента

## [0.2.5-beta] - 2022-08-07

### Добавлено
- Поддержка sibling элемента из внешнего файла
- Извлечение параметров запроса для сервиса в отдельный тип
- Вынесен yarn

### Исправлено
- Исправлен некорректный порядок в sortByRequired

## [0.2.3] - 2022-03-20

### Исправлено
- Первый корневой путь в блоке импортов был некорректен, когда модели находились в той же папке, что и серверы (было '/', нужно './')

## [0.2.2] - 2022-02-10

## [0.2.2-beta] - 2022-01-19

### Исправлено
- Внутренние перечисления должны начинаться с заглавной буквы и иметь префикс

## [0.2.1-beta] - 2022-01-15

### Исправлено
- Ошибка с некорректными путями в параметрах ввода генератора

## [0.2.0-beta] - 2021-12-13

### Добавлено
- Добавлена настройка публикации (CI) для релизов
- Общая конфигурация перемещена из массива в корневой блок
- Путь вывода для моделей, сервисов, схем и core можно задавать отдельно

### Исправлено
- Ошибка с некорректным префиксом для enum, если у него было свойство "type"

## [0.1.32] - 2021-12-03

### Исправлено
- Ошибка с контекстом

## [0.1.30] - 2021-12-01

### Добавлено
- Добавлен префикс к имени класса (I - интерфейс, E - enum, T - type)

### Исправлено
- Начало имени класса из компонента блока с заглавной буквы

## [0.1.29] - 2021-11-19

### Добавлено
- Добавлена встроенная поддержка axios

### Исправлено
- Некорректное имя файла при расширении '.yml'

## [0.1.28] - 2021-11-02

### Исправлено
- Ошибки в блоках импорта на Windows (обратный слэш)

## [0.1.27] - 2021-10-30

### Добавлено
- Добавлен CHANGELOG.md
