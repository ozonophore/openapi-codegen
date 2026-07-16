## ADDED Requirements

### Requirement: переиспользуемые core-файлы размещаются в __shared__/core
Когда `reuseMode === "auto-group"`, `cacheStrategy === "reuse"` и нетривиальный LCA даёт `SharedFolderWriter`, генератор ДОЛЖЕН размещать canonical-содержимое каждого переиспользуемого файла client core по пути
`{LCA}/__shared__/core/{relativeCorePath}`,
где `{relativeCorePath}` — путь относительно `outputCore` item (например `ApiError.ts`, `executor/requestExecutor.ts`, `interceptors/withInterceptors.ts`).

Для каждого такого shared-файла каждый участвующий item ДОЛЖЕН получить stub по пути `{itemOutputCore}/{relativeCorePath}`, тело которого — только реэкспорт через `computeStoreRelativeImport` (тот же паттерн stub, что у models).

#### Scenario: ApiError лежит canonical в shared core
- **WHEN** два item генерируются с совместимыми core-опциями и `reuseMode: "auto-group"`
- **THEN** `{LCA}/__shared__/core/ApiError.ts` содержит полный модуль `ApiError`, а `core/ApiError.ts` каждого item — stub-реэкспорт

#### Scenario: вложенный путь executor сохраняется
- **WHEN** shared core-файл — это `executor/requestExecutor.ts`
- **THEN** canonical-путь — `{LCA}/__shared__/core/executor/requestExecutor.ts`, а stub item — под `core/executor/requestExecutor.ts` этого item

#### Scenario: режим copy без изменений
- **WHEN** `reuseMode` равен `"copy"` (или auto-group откатывается к copy)
- **THEN** core-файлы полностью пишутся под `outputCore` каждого item без обязательных stubs в `__shared__/core`

---

### Requirement: эффективный request конфиг ограничивает шаринг request-sensitive core
Генератор ДОЛЖЕН вычислять эффективный `request` каждого item как после `normalizeOptions` (`item.request ?? root.request`). Core-файлы, чьё содержимое зависит от custom request / executor / связанных флагов шаблона, ДОЛЖНЫ шариться только между items с одинаковым transport fingerprint. Fingerprint ДОЛЖЕН включать как минимум: эффективный `request` (или generated-default), `customExecutorPath` (или отсутствие), `httpClient`, `useCancelableRequest`, и факт экспорта `requestRaw` custom request при его наличии.

#### Scenario: корневой request шарится между items
- **WHEN** задан корневой `request`, ни один item не переопределяет `request`, и auto-group shared core активен
- **THEN** `request.ts` (и другие request-sensitive файлы с идентичным содержимым) шарятся под `__shared__/core/` со stubs в каждом item

#### Scenario: per-item override request запрещает кросс-item шаринг request
- **WHEN** item A наследует корневой `request`, а item B задаёт другой `items[].request`
- **THEN** A и B НЕ ДОЛЖНЫ делить один canonical `request.ts`; каждый сохраняет корректный полный или group-local файл для своего эффективного request

#### Scenario: одинаковый per-item request всё ещё шарится
- **WHEN** два item задают один и тот же путь `request` (явно или через один и тот же root fallback)
- **THEN** они МОГУТ шарить `request.ts` под `__shared__/core/` при активном auto-group

---

### Requirement: OpenAPI и другие content-divergent core-файлы не шарятся ошибочно
Относительный путь core ДОЛЖЕН шариться только когда отрендеренное (или скопированное) содержимое для этого пути идентично в наборе шаринга. Файлы, которые обычно различаются по спеке (в частности `OpenAPI.ts` с разными `server`/`version`), ДОЛЖНЫ оставаться полными файлами под `outputCore` каждого item, когда содержимое различается.

#### Scenario: разные server оставляют локальный OpenAPI
- **WHEN** два item производят разное содержимое `OpenAPI.ts`
- **THEN** у каждого item полный `OpenAPI.ts` под своим `outputCore`, и нет одного stubbed shared `OpenAPI.ts`, навязывающего один server обоим

#### Scenario: идентичный OpenAPI может шариться
- **WHEN** два item рендерят идентичное содержимое `OpenAPI.ts` при auto-group
- **THEN** генератор МОЖЕТ разместить один canonical-файл под `__shared__/core/OpenAPI.ts` со stubs у каждого item

---

### Requirement: конфликт shared-core откатывается к полному локальному файлу
Если два item мапятся на один `{LCA}/__shared__/core/{relativeCorePath}` с разными content hash, генератор НЕ ДОЛЖЕН перезаписывать canonical чужим содержимым для проигравшего item. Item с конфликтующим содержимым ДОЛЖЕН сохранить полный локальный файл по пути своего `outputCore`, и ДОЛЖНО быть залогировано предупреждение.

#### Scenario: конфликт hash сохраняет локальную копию
- **WHEN** содержимое `ApiRequestOptions.ts` у item B отличается от уже записанного shared canonical
- **THEN** `core/ApiRequestOptions.ts` у item B — полный модуль (не stub на неверный canonical), и эмитируется warn

---

### Requirement: импорты сервисов в core продолжают работать через stubs
После генерации shared-core сервисы и другие сгенерированные модули, импортирующие из `core/` item, ДОЛЖНЫ продолжать резолвиться к тем же именам модулей; stubs ДОЛЖНЫ реэкспортировать shared-реализацию, чтобы относительные импорты из сервисов не требовали переписывания путей на `__shared__`.

#### Scenario: сервис по-прежнему импортирует ../core/ApiError
- **WHEN** файл сервиса импортирует `ApiError` по item-local core-пути
- **THEN** импорт резолвится через stub к shared canonical модулю без изменения пути импорта в сервисе
