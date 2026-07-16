## Контекст

Сейчас `reuseMode: "auto-group"` (при `cacheStrategy: "reuse"`) находит LCA output-путей items и размещает общие **models/schemas/enums** в `{LCA}/__shared__/{kind}/` со stub-реэкспортами в дереве каждого item (`SharedFolderWriter` + `reuseWriterHelpers`).

Клиентское **ядро (core)** по-прежнему полностью пишется на каждый item через `writeClientCore` в `{output}/core` (или `outputCore`). `OpenApiClient.warnOnSharedCoreServiceOutputs` прямо говорит, что ReuseStore покрывает только models/schemas. В итоге boilerplate (`ApiError`, `ApiRequestOptions`, executor/interceptors, дефолтный `request`, …) дублируется между multi-spec клиентами с одним HTTP-стеком.

Нюанс конфига: в `TRawOptions` / `normalizeOptions` эффективный `request` — это `item.request ?? rawOptions.request`. Корневой `request` действует на все items, пока item его не переопределит. `customExecutorPath` сейчас только на root. Поля из спеки (`server`, `version` в `OpenAPI.ts`) обычно различаются между items.

## Цели / Не-цели

**Цели:**

- При `reuseMode: "auto-group"` и нетривиальном LCA размещать **переиспользуемые** core-файлы один раз в `{LCA}/__shared__/core/` (с зеркалированием относительных путей item `core/`, напр. `executor/…`, `interceptors/…`).
- Оставлять stubs на core-путях каждого item, чтобы существующие импорты сервисов (`../core/…`) продолжали работать.
- Шарить core-файл только при совпадении **per-file / per-group fingerprint** после нормализации опций — особенно эффективный `request`, `customExecutorPath`, `httpClient`, `useCancelableRequest`, `modelsMode` (для `BaseDto`/`dtoUtils`), а также идентичность отрендеренного содержимого для файлов, привязанных к спеке.
- Учитывать корневой vs per-item `request`: одинаковый унаследованный request → шарить; разные override → не шарить затронутые файлы (как минимум `request.ts` и адаптеры, зависящие от `useCustomRequestRaw`).

**Не-цели:**

- Новые ключи конфига или третье значение `reuseMode`.
- Шаринг **services** тем же способом (вне scope).
- Изменение поведения `reuseMode: "copy"`.
- Делать `customExecutorPath` per-item (сохранить текущую root-only семантику, если иное уже не поддержано).
- Дедупликация core через content-addressed ReuseStore (только filesystem `__shared__/core` + stubs; store остаётся для models).

## Решения

### 1. Раскладка: `{LCA}/__shared__/core/**` + stubs

**Выбор:** Тот же корень `__shared__`, что у models; подкаталог `core/` сохраняет относительную структуру из `writeClientCore` (`OpenAPI.ts`, `request.ts`, `executor/requestExecutor.ts`, …).

**Рассмотренные альтернативы:**
- Отдельный `{LCA}/core` без `__shared__` — отвергнуто: ломает фиксированный контракт `__shared__` и риск коллизии с реальным item по имени `core`.
- Шарить только плоский список «безопасных» файлов без вложенных executor/interceptors — отвергнуто: неполно; stubs нуждаются в том же дереве для стабильности импортов.

### 2. Переиспользуемость per-file, а не all-or-nothing бандл ядра

**Выбор:** Решение share vs copy **по относительному пути core**. Пример: шарить `ApiError.ts` / `ApiRequestOptions.ts` между всеми items LCA-группы; оставлять `OpenAPI.ts` per-item при разных `server`/`version`; шарить `request.ts` только внутри группы с одинаковым effective request.

**Рассмотренные альтернативы:**
- Шарить всё ядро только при полном совпадении всех опций — отвергнуто: теряется большая часть выигрыша, когда отличается только OpenAPI.
- Всегда шарить OpenAPI и инжектить server/version в runtime — отвергнуто: слишком большой breaking change API сгенерированного клиента.

### 3. Transport fingerprint для request-sensitive файлов

**Выбор:** После `normalizeOptions` строить effective transport key из:

- resolved пути `request` (или «generated-default»)
- `customExecutorPath` (или отсутствие)
- `httpClient`
- `useCancelableRequest`
- наличия `requestRaw` в custom request (та же проверка, что в `writeClientCore`), если custom request задан

Файлы, чей template/copy зависит от этого ключа (`request.ts`, `legacyRequestAdapter.ts` и любые файлы из custom copy), шарятся только между items с равными ключами. Чистый boilerplate (`ApiError`, `ApiRequestOptions`, `ApiResult`, `HttpStatusCode`, оболочки interceptors, дефолтные куски executor с одинаковыми входами шаблона) может шариться по всей LCA-группе при совпадении content hash отрендеренного содержимого.

**Почему:** Одного корневого `request` недостаточно; per-item override должен предотвращать неверный stub несовместимого `request.ts`.

### 4. Точка интеграции: расширить write-path `writeClientCore`

**Выбор:** Когда есть `sharedFolderWriter`, `writeClientCore` (или тонкий helper) пишет canonical в `__shared__/core/<rel>` при первой записи данного content hash и stub на путь item `outputCore`. First writer wins для данного relative path + content hash; конфликт (тот же путь, другой hash) → полный файл на пути item + warn (без тихого неверного шаринга).

**Рассмотренные альтернативы:**
- Постпроцесс после генерации всех items — отвергнуто: сложнее при текущем последовательном цикле `generateSingle`; двойной I/O.
- Только хук в ReuseStore — отвергнуто: core сейчас не в artifact-манифесте; scope остаётся filesystem auto-group.

### 5. LCA / fallback без изменений

**Выбор:** Переиспользовать существующий `resolveOutputGroups` + warn-and-fallback-to-copy. Shared core включается только когда сконструирован `SharedFolderWriter` (тот же gate, что у models).

### 6. Текст предупреждений

**Выбор:** Обновить `warnOnSharedCoreServiceOutputs`, чтобы при активном auto-group shared core сообщение больше не утверждало, что core никогда не шарится; по-прежнему предупреждать о коллизиях `outputCore`, которые перезапишут файлы вне модели stubs.

### 7. Namespaced store-пути включают schemaHash (`reuseOnConflict: "namespace"`)

**Контекст (обнаружено при прогоне `example/openapi.marauder.config.json`):**  
ReuseStore уже содержал namespaced-артефакт `EEnumWithNumbers` для `v3` (`…/EnumWithNumbers__v3__{optionsHash}.ts`, `schemaHash=f961a084…`). Новый прогон с тем же `specItem` и тем же `optionsSliceHash`, но другим `schemaHash` (`4e98c7f5…`) шёл в ветку `reuseOnConflict: "namespace"`, строил **тот же relative path** без учёта schema и падал в `assertPathAvailable` с `ReuseConflictError` «v3» vs «v3» — хотя namespace как раз должен был разрешить конфликт.

**Выбор:**  
`buildNamespacedModelArtifactRelativePath` / `buildNamespacedSchemaArtifactRelativePath` принимают `schemaHash` и формируют путь:

`artifacts/{kind}/{Name}__{specItem}__{schemaHash8}__{optionsSliceHash8}.ts`

(для schema — `…Schema__{specItem}__{schemaHash8}__…`).

**Рассмотренные альтернативы:**
- Чистить store перед generate — отвергнуто: не чинит повторные прогоны / drift schema.
- Игнорировать path collision в `assertPathAvailable` при namespace — отвергнуто: скрывает реальные коллизии разных артефактов.
- Включать schemaHash только в artifactKey (как сейчас) без path — отвергнуто: path collision остаётся.

**Почему рядом с shared-core:** smoke Marauder (`reuseMode: auto-group` + `cacheStrategy: reuse` + `reuseOnConflict: namespace`) — типичный сценарий этого change; без фикса generate по примеру падает до проверки shared-core.

## Риски / компромиссы

- **[Риск] Неверный шаринг `request.ts` при разном root/item request** → Митигация: fingerprint по effective resolved request; тесты root-only, per-item override и mixed.
- **[Риск] Неверная глубина stub для `core/executor/` или кастомного `outputCore`** → Митигация: всегда `computeStoreRelativeImport(stubPath, canonicalPath)`; path-matrix тесты.
- **[Риск] Случайный шаринг `OpenAPI.ts` с чужим server** → Митигация: не шарить, пока content hash не равен (включает server/version).
- **[Риск] Barrel `core/index.ts` некорректно реэкспортирует stubs** → Митигация: stubs остаются именованными файлами; генерация index без изменений, если реэкспортирует локальные имена.
- **[Риск] Path collision namespaced-артефактов при schema drift в той же спеке** → Митигация: `schemaHash` в namespaced relative path; unit-тест uniqueness; smoke `openapi.marauder.config.json`.
- **[Компромисс] Частичный шаринг (часть файлов stub, часть local)** → Приемлемо; задокументировать в Marauder reuse docs.
- **[Компромисс] First-writer wins для одинаковых relative paths** → Детерминировано при стабильном порядке items; задокументировать, что порядок items должен быть стабильным.
- **[Компромисс] Старые namespaced-файлы в store без schemaHash в имени** → Сосуществуют с новыми путями; GC/повторная генерация подтянет новые ключи; при желании пользователь может очистить `.openapi-codegen-store`.

## План миграции

1. Только opt-in через существующие `reuseMode: "auto-group"` + `cacheStrategy: "reuse"` — миграция конфига не нужна.
2. Перегенерация может заменить дублированные core-файлы на stubs + дерево `__shared__/core` — ожидаемо для пользователей auto-group.
3. Откат: `reuseMode: "copy"` и перегенерация.

## Открытые вопросы

- Блокирующих нет: в качестве финального gate шаринга для каждого core-файла предпочитать равенство content-hash (fingerprint — быстрый pre-filter для request-sensitive файлов). При реализации подтвердить: `BaseDto`/`dtoUtils` требуют одинаковый `modelsMode` в прогоне (да — эмитить эти файлы только при `modelsMode === classes` и шарить только среди таких items).
