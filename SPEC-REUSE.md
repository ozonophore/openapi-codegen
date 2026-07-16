# SPEC-REUSE — Механизм переиспользования spec-артефактов

> Reverse-engineered PDD от кода. Описывает существующую реализацию как проектный документ,
> включая известные проблемы и технический долг.
>
> Сгенерировано: 2026-07-17 · Источник: src/core/reuseStore/, src/core/utils/GenerationCache.ts,
> src/core/specAnalysis/, src/core/OpenApiClient.ts

---

## 1. Proposal — Что и зачем

### Проблема

При генерации клиентов для множества OpenAPI-спецификаций (multi-spec batch) одинаковые
модели (`UserDto`, `PaginationSchema`) генерируются повторно для каждой спеки — дублируя файлы,
замедляя генерацию и создавая рассинхрон при ручных правках.

### Решение

Три независимых механизма кэширования, образующих иерархию:

```
cache: true/false                   ← мастер-выключатель
└── cacheStrategy
    ├── content  → writeFileIfChanged (пропуск одинаковых файлов)
    ├── entity   → GenerationCache (fingerprint spec → skip целой генерации item)
    └── reuse    → ReuseStore (cross-spec дедуп model/schema/enum артефактов)
         ├── reuseOnConflict: fail | namespace
         └── reuseMode: copy | auto-group

cachePath   → путь к store/файлу (разный resolve для entity и reuse)
cacheDebug  → hit/miss логи + тайминги
preAnalyze  → независимый dry-run ДО генерации (только лог, не кэш)
```

### Когда что включать

| Сценарий | Рекомендация |
|----------|-------------|
| Одна спека | `cacheStrategy: entity` — skip при неизменённой спеке |
| Несколько спек со схожими моделями | `cacheStrategy: reuse` — дедупликация артефактов |
| Monorepo, общая папка моделей | `cacheStrategy: reuse` + `reuseMode: auto-group` |
| Только incremental write | `cacheStrategy: content` (легковесно, без skip генерации) |
| Узнать пересечения перед генерацией | `preAnalyze: true` |

---

## 2. Design — Как устроено

### 2.1 CLI-флаги

Объявлены в `src/cli/index.ts` (строки 96–114), все в команде `generate`:

| Флаг | Тип | Default (runtime) | Описание |
|------|-----|-------------------|----------|
| `--cache` | boolean | `false` | Мастер-выключатель |
| `--cachePath <value>` | string | `'.openapi-codegen-store'` | Путь к store/файлу |
| `--cacheStrategy <value>` | `content\|entity\|reuse` | `'reuse'` | Стратегия |
| `--cacheDebug` | boolean | `false` | Debug hit/miss логи |
| `--reuseOnConflict <value>` | `fail\|namespace` | `'fail'` | Политика конфликтов |
| `--reuse-mode <value>` | `copy\|auto-group` | `'copy'` | Раскладка shared-файлов |
| `--pre-analyze` | boolean | `false` | Cross-spec анализ до генерации |

**Важно:** на уровне Commander нет `conflicts`/`implies`. Все зависимости — runtime:
- `reuseMode: auto-group` без `cacheStrategy: reuse` → warn + ignore
- `reuseOnConflict` без reuse store → silently ignored
- `cacheDebug` при `content` → только info-лог

Флаги `preAnalyze` и `reuseMode` — root-only (не наследуются в per-item).

### 2.2 Оркестрация: `generateCodeForItems` (`OpenApiClient.ts`)

```
generateCodeForItems(items)
  ├── validateConsistentCacheSettings(items)     // warn-only
  ├── cacheEnabled = items[0].cache === true
  ├── cacheStrategy = items[0].cacheStrategy
  ├── useReuseStore = cacheEnabled && strategy === 'reuse'
  │
  ├── [reuse] new ReuseStore(cachePath) → load()
  ├── [entity | reuse+classes] new GenerationCache per outputRoot → load()
  ├── [auto-group + useReuseStore + LCA ok] new SharedFolderWriter(lca)
  │
  ├── [preAnalyze] runPreAnalyze(items)          // до generateSingle
  │
  ├── for item of items:
  │     generateSingle(item, cache, reuseContext)
  │
  ├── [entity] generationCache.save()            // ТОЛЬКО entity
  ├── [reuse] reuseStore.gc(referencedKeys) → save()
  ├── finalizeSpecAnalysis / writeGenerationReport
  └── cleanupStaleOutputs
```

Все cache* берутся из **`items[0]`**, не из per-item (они идентичны после `normalizeOptions`,
где root-уровень копируется во все items).

### 2.3 GenerationCache (`src/core/utils/GenerationCache.ts`)

**Гранулярность:** весь item (spec + output-пути) → список сгенерированных файлов.

**JSON-структура** (по умолчанию `{outputRoot}/.openapi-codegen-cache.json`):

```json
{
  "version": 1,
  "entries": {
    "<SHA256(input+output paths)>": {
      "key": "...",
      "fingerprint": "<SHA256(generatorVersion + specHash + options)>",
      "files": ["/abs/path/UserDto.ts", ...],
      "updatedAt": 1721234567890
    }
  }
}
```

**Lifecycle:**

| Этап | Действие |
|------|----------|
| `load()` | Читает JSON, silent-fail при отсутствии или неверной version |
| `hit-check` | key найден + fingerprint совпал + все files **exist** → skip генерации |
| `miss-write` | После генерации: `set({key, fingerprint, files, updatedAt})` |
| `save()` | Только при `cacheStrategy === 'entity'` |

**Key** = SHA-256(`input` + `output` + `outputCore` + `outputServices` + `outputModels` + `outputSchemas`)

**Fingerprint** = SHA-256(`cacheFingerprintVersion=1` + `generatorVersion` + `specHash` + options slice)

### 2.4 ReuseStore (`src/core/reuseStore/ReuseStore.ts`)

**Гранулярность:** отдельный model/schema/enum артефакт.

**Структура store** (`{cachePath}/manifest.json`):

```json
{
  "version": 2,
  "artifacts": {
    "<artifactKey>": {
      "name": "UserDto",
      "kind": "model",
      "schemaHash": "<MD5>",
      "optionsSliceHash": "<MD5>",
      "relativePath": "artifacts/models/UserDto__ab12cd34.ts",
      "byteSize": 1234,
      "contentHash": "<MD5>",
      "referencedBy": [{ "specItem": "petstore", "outputPath": "..." }]
    }
  },
  "specItems": {}
}
```

**Lookup алгоритм:**

```
artifactKey = MD5(schemaHash | name | kind | optionsSliceHash)

1. artifacts[artifactKey] exists → HIT
2. nameKindIndex[name|kind] exists && schemaHash differs → CONFLICT
3. else → MISS
```

**Hit-path:**
1. `readArtifactIfIntegrityOk` → size + contentHash (при byteSize > 0: только size!)
2. Integrity OK → скопировать содержимое в output / создать stub
3. `markReferenced(artifactKey, specItem, outputPath)`

**Miss-path:**
1. Render артефакта
2. `writeArtifact(relativePath, content)` → файл в store
3. `register({name, kind, schemaHash, ...})` → запись в manifest

**Конфликт:**
- `fail` (default) → `throw ReuseConflictError`
- `namespace` → spec-scoped path (`UserDto__specName__hash8.ts`), `register({skipConflictCheck: true})`

**GC:** после всех specs — удаляет артефакты, чьих ключей нет в `referencedArtifactKeys`.

### 2.5 ArtifactFingerprinter (`src/core/reuseStore/ArtifactFingerprinter.ts`)

**Schema hash** (MD5):
- Whitelist полей: `type, properties, required, enum, items, allOf, oneOf, anyOf, format, nullable, additionalProperties, description`
- Normalize: рекурсивный обход, `$ref` частично резолвится через обёртку `{components: {schemas: {__root: schema}}}`
- Memo: `WeakMap<schema-object, hash>`

**Options slice** (`buildOptionsSlice`):
- Codegen-поля: `validationLibrary, modelsMode, httpClient, useOptions, useDateType, ...`
- Плагины: только **имена** (не конфиг)

**Artifact key** = MD5(`schemaHash | name | kind | optionsSliceHash`)

### 2.6 SharedFolderWriter + OutputGroupResolver

**LCA-алгоритм** (`src/core/reuseStore/OutputGroupResolver.ts`):
1. Нормализация `\` → `/`
2. Посегментный common prefix по первому пути
3. Null если: < 2 путей, LCA = `/`, LCA совпадает с одним из inputs

**auto-group layout при LCA ok:**

```
{LCA}/__shared__/models/UserDto.ts    ← canonical (полное тело)
{LCA}/__shared__/schemas/XxxSchema.ts
{item.output}/models/UserDto.ts       ← stub: export * from '../../__shared__/models/UserDto'
```

Import path вычисляется через `computeStoreRelativeImport(stubPath, canonicalPath)` =
`path.relative(dirname(stub), canonical).replace(/\.ts$/, '')`.

**Важно:** `SharedFolderWriter.write()` не вызывается нигде — реальная логика inline в
`reuseWriterHelpers.ts`. Класс используется только как holder для `lca`.

### 2.7 preAnalyze + CrossSpecAnalyzer

**`runPreAnalyze`** (`src/core/specAnalysis/runPreAnalyze.ts`):
1. Parse каждый item: `getOpenApiSpec` → `ParserV2/V3.parse`
2. `buildModelSchemaMap(context)` → `Record<name, schema>`
3. `buildManifestFromParsedSpecs` → синтетический `ReuseStoreManifest` (in-memory)
4. `runCrossSpecAnalysis(manifest, [])` → только cross-spec, без per-spec детекторов
5. Лог через `logger.forceInfo` — только stdout, файл не пишется, генерацию не останавливает

**CrossSpecAnalyzer детекторы:**

| Детектор | Category | Severity | Что ищет |
|----------|----------|----------|----------|
| `detectNameHashConflicts` | `cross-spec-name-hash-conflict` | high | Одно имя, разные schemaHash в разных specs |
| `detectReuseOpportunities` | `cross-spec-reuse-opportunity` | info | Артефакт referenced в ≥2 specs |
| `detectCrossSpecDrift` | `cross-spec-drift` | info | **Dead code** — условие = conflict, все имена уже в skipNames |
| `detectSharedOutputCollisionRisk` | `shared-output-collision-risk` | high | Два spec → один outputModels/Schemas; **мёртво** при preAnalyze (items=[]) |

**Связь с ReuseStore:** нет. `preAnalyze` независим — использует те же hash-утилиты,
но не читает disk-store и не влияет на генерацию.

**Двойной parse:** `preAnalyze` парсит все specs → затем каждый `generateSingle` снова
`getOpenApiSpec` + `Parser.parse`. Промежуточный кэш отсутствует.

---

## 3. Известные проблемы

### P0 — Критические (данные теряются или неверны)

#### P0.1 Entity-fallback без `save` при `reuse + modelsMode:classes`

**Файлы:** `OpenApiClient.ts:479–482, 857–864`

При `cacheStrategy: 'reuse'` и `modelsMode: 'classes'` ReuseStore отключается для item
и включается entity-cache fallback. Но `generationCache.save()` вызывается только при
`cacheStrategy === 'entity'`:

```typescript
// OpenApiClient.ts:479–482
if (cacheEnabled && cacheStrategy === 'entity') {
    for (const generationCache of generationCaches.values()) {
        await generationCache.save();  // НЕ вызывается при strategy='reuse'
    }
}
```

В результате: `generationCache.set()` пишет в in-memory map, но между запусками кэш не
персистентен — entity-кэш при `reuse + classes` полностью бесполезен.

**Фикс:** добавить `save()` при `needsEntityCacheFallback` или вынести save из условия.

---

#### P0.2 ReuseStore integrity не проверяет contentHash при `byteSize > 0`

**Файл:** `ReuseStore.ts:228–233`

```typescript
// ReuseStore.ts
if (entry.byteSize > 0) {
    return content;  // contentHash не проверяется!
}
if (ReuseStore.hashContent(content) !== entry.contentHash) {
    return null;
}
```

Нормальный путь (любой непустой файл) — integrity = только размер. Подмена/порча файла
с тем же размером → ложный hit → в output попадает повреждённый артефакт.

**Фикс:** всегда проверять `contentHash` независимо от `byteSize`.

---

#### P0.3 `GenerationCache.load()` без try/catch при JSON.parse

**Файл:** `GenerationCache.ts:38–44`

```typescript
const raw = await fileSystemHelpers.readFile(this.cachePath, 'utf8');
const parsed = JSON.parse(raw) as CacheData;  // нет try/catch
```

Повреждённый JSON-файл → `SyntaxError` → падение всей генерации. При несовместимой
`version` — soft-fail, при битом JSON — hard-fail без диагностики.

**Фикс:** обернуть в try/catch, логировать и возвращать пустой кэш.

---

### P1 — Высокие (silent wrong behavior)

#### P1.1 `nameKindIndex` несовместим с `reuseOnConflict: namespace`

**Файлы:** `ReuseStore.ts:182, 302–306`, `reuseWriterHelpers.ts:284–287`

`nameKindIndex` хранит ровно **один** slot на `name|kind`. При namespace-регистрации
вторая схема перезаписывает индекс. После `load()` побеждает последний
`Object.values()` → неверный `existing` в `ReuseConflictError` и `findNameKindConflict`.

#### P1.2 Неатомарный `save()` в `ReuseStore`

**Файл:** `ReuseStore.ts:80–89`

Прямой `writeFile(manifest.json)`. Crash mid-write → corruption манифеста.
На следующем запуске: bad manifest → silent empty store (R3) → потеря всей истории.

**Фикс:** write to temp file + atomic rename.

#### P1.3 Silent discard при bad/v1 manifest — orphan-файлы не удаляются

**Файл:** `ReuseStore.ts:71–73`

Bad manifest → `this.manifest = empty`. GC работает с `referencedKeys` текущего run,
а не с файлами на диске → старые `artifacts/models/*.ts` не удаляются никогда.
Документация обещает GC orphan'ов, но эта логика отсутствует.

#### P1.4 Нет file lock на `ReuseStore` / `GenerationCache`

Два параллельных CLI на один store → race: оба `load` → оба пишут → last writer wins,
возможна потеря entries. Актуально для monorepo с параллельными `pnpm` workspace builds.

#### P1.5 `GenerationCache` hit проверяет только `exists`, не содержимое

**Файл:** `OpenApiClient.ts:914–921`

```typescript
private async filesExist(paths: string[]): Promise<boolean> {
    for (const filePath of paths) {
        const exists = await fileSystemHelpers.exists(filePath);
        // нет проверки содержимого или hash
    }
}
```

Вручную изменённый файл при том же fingerprint → ложный hit → генерация не перезапишет.

#### P1.6 Абсолютный `cachePath` при dual strategy — file/dir clash

При `cacheStrategy: 'reuse'` store root = директория; при `entity` — JSON-файл.
Если в одном проекте использовать абсолютный общий `cachePath` при `reuse + classes-fallback`:
- ReuseStore ждёт директорию + `manifest.json`
- GenerationCache пишет JSON **по этому пути как файл**
→ реальный конфликт (файл vs директория).

---

### P2 — Средние (неконсистентность, неожиданное поведение)

#### P2.1 Схема fingerprint — неполный whitelist

**Файл:** `ArtifactFingerprinter.ts:5`

```typescript
const SCHEMA_HASH_KEYS = new Set([
    'type', 'properties', 'required', 'enum', 'items', 'allOf', 'oneOf', 'anyOf',
    'format', 'nullable', 'additionalProperties', 'description'
]);
```

**Пропущены:** `minimum`, `maximum`, `pattern`, `const`, `title`, `default`, `discriminator`,
`exclusiveMinimum`, `exclusiveMaximum`, `minLength`, `maxLength`, `minItems`, `maxItems`.

Две схемы `{ type: 'string' }` и `{ type: 'string', minLength: 1 }` получат одинаковый hash
→ ложный reuse, constraints теряются.

#### P2.2 Stack overflow на циклических `$ref`

**Файл:** `ArtifactFingerprinter.ts:46–58`

Нет `visited`-set при рекурсивном `normalizeSchemaNode`. Циклические `$ref`
→ бесконечная рекурсия → stack overflow.

#### P2.3 `required`/`enum` — порядок массива влияет на hash

`['a', 'b']` и `['b', 'a']` → разный `stableStringify` → разный hash → ложный conflict/miss.
`stableStringify` сортирует ключи объекта, но не массивы.

#### P2.4 Плагины: hash только по именам, не по конфигурации

**Файл:** `ArtifactFingerprinter.ts:129–137`

Изменение конфигурации плагина (не имени) → тот же `optionsSliceHash` → ложный hit.

#### P2.5 GC не чистит `specItems` в манифесте

**Файл:** `ReuseStore.ts:261–289`

После удаления артефактов в `gc()` соответствующие ссылки в `specItems[].artifactKeys`
остаются → мёртвые ссылки, раздутый манифест.

#### P2.6 Нет GC у `GenerationCache` — накопление мёртвых ключей

Удалённые/переименованные specs оставляют ключи в JSON навсегда. При большом количестве
ротаций файл неограниченно растёт.

#### P2.7 `validateConsistentCacheSettings` — практически мёртвый код

**Файл:** `OpenApiClient.ts:571–584`

Проверяет `items` на расхождение `cache*`-полей, но после `normalizeOptions` все items
идентичны (root копируется во все). Предупреждение никогда не появится в типичном сценарии.

#### P2.8 Dual default `cacheStrategy` — `reuse` vs `entity`

- Новый конфиг / CLI: `'reuse'` (из `Consts.ts`)
- Конфиг после V4→V5 migration: `'entity'` (hardcoded в `AllMigrationPlans.ts`)

Поведение зависит от истории миграций, а не от текущей версии схемы.
Документировано, но неинтуитивно.

#### P2.9 `SharedFolderWriter.write()` — мёртвый API

**Файл:** `SharedFolderWriter.ts:29–41`

Метод `write()` нигде не вызывается. Реальная логика — inline в `reuseWriterHelpers.ts`.
Класс используется только как holder для `lca`. Вводит в заблуждение при чтении.

#### P2.10 `cross-spec-drift` детектор никогда не срабатывает

**Файл:** `CrossSpecAnalyzer.ts:74–91`

Условие drift = то же, что conflict. Conflict-имена пропускаются через `skipNames`
→ drift никогда не эмитится.

#### P2.11 `detectSharedOutputCollisionRisk` мёртв при `preAnalyze`

**Файл:** `CrossSpecAnalyzer.ts` + `runPreAnalyze.ts`

`runPreAnalyze` вызывает `runCrossSpecAnalysis(manifest, [])` — пустой список items.
Детектор `detectSharedOutputCollisionRisk` использует `items` из контекста → всегда пуст.

#### P2.12 Двойной (тройной) parse при `preAnalyze + specAnalysis`

`runPreAnalyze` → parse все specs (раз).
Каждый `generateSingle` → `getOpenApiSpec` + `Parser.parse` (второй).
При `specAnalysis.enabled` + `registerParsedSpec` → третий смысловой проход.
Промежуточного кэша нет.

#### P2.13 Namespace path collision при одинаковом `specItem` basename

**Файл:** `reuseHelpers.ts:28–36`

Namespace = basename spec-файла. Два пути с одинаковым basename (например,
`api-a/spec.yaml` и `api-b/spec.yaml`) → одинаковый namespace → path collision.

#### P2.14 Canonical path в `__shared__` — только по имени, без hash

**Файл:** `reuseWriterHelpers.ts:82–89`

```typescript
const canonicalPath = join(ctx.sharedFolderWriter.lca, SHARED_FOLDER_NAME, kindDir, `${model.name}.ts`);
```

При `reuseOnConflict: 'namespace'` два разных `UserDto` в store имеют разные relativePath,
но в `__shared__` оба пишутся как `UserDto.ts` → последний перезаписывает первый.

#### P2.15 Fingerprint entity vs preAnalyze — разные `optionsSliceHash`

`preAnalyze` использует константу `'spec-analysis'` как optionsSliceHash.
`registerParsedSpec` (specAnalysis) использует сырые component schemas, не `buildModelSchemaMap`.
Хеши между двумя путями могут не совпадать → разные результаты cross-spec анализа.

---

### P3 — Низкие (code smell, UX)

| ID | Описание | Файл |
|----|----------|------|
| P3.1 | `ArtifactKind: 'core'` в типе, writers пишут только `model/schema/enum` | `types.ts:3` |
| P3.2 | `ManifestReference.kind` всегда `'artifact'` — мёртвое поле | `types.ts:25` |
| P3.3 | `ReuseConflictError` hint говорит «Model», хотя kind может быть schema/enum | `types.ts:75–79` |
| P3.4 | `reuseOnConflict = 'fail'` дублирует Consts в `reuseWriterHelpers.ts:46` | `reuseWriterHelpers.ts:46` |
| P3.5 | `getManifest()` отдаёт живой mutable object (нет `readonly` / clone) | `ReuseStore.ts:257–258` |
| P3.6 | `replace(/^[IET]/, '')` в reuseHelpers хрупко к именам `Enum`, `Interface`, `Type` | `reuseHelpers.ts:63` |
| P3.7 | Финтерпринт использует MD5 (коллизии теоретически возможны) | `ArtifactFingerprinter.ts:8` |
| P3.8 | `GenerationCache` не имеет GC; entity-cache JSON растёт бесконечно | `GenerationCache.ts` |
| P3.9 | `inconsistentResponseTypes` — ложные позитивы: группировка по первому URL-сегменту | `detectors/inconsistentResponseTypes.ts` |
| P3.10 | Нет unit-тестов: LCA/SharedFolderWriter/computeStoreRelativeImport, namespace, cyclic $ref | тесты |

---

## 4. Архитектурная карта

```
CLI flags
  --cache --cacheStrategy --cachePath --cacheDebug
  --reuseOnConflict --reuse-mode --pre-analyze
         ↓
OpenApiClient.generateCodeForItems
  │
  ├─ [opt] runPreAnalyze()
  │     └─ CrossSpecAnalyzer → stdout only
  │
  ├─ [entity] GenerationCache × outputRoot
  │     └─ load → hit(skip) / miss(generate+set) → save
  │
  ├─ [reuse] ReuseStore (single, shared)
  │     └─ load → lookup(hit|miss|conflict) → gc → save
  │
  ├─ [auto-group] SharedFolderWriter
  │     └─ lca/{__shared__}/{kind}/{name}.ts
  │
  └─ for item: generateSingle(item, generationCache?, reuseContext?)
        └─ writeModelWithReuse / writeSchemaWithReuse
              └─ ArtifactFingerprinter.hashSchema + buildArtifactKey
```

---

## 5. Матрица стратегий

| `cache` | `cacheStrategy` | `modelsMode` | Persist | Skip целой генерации | Дедуп артефактов |
|---------|-----------------|--------------|---------|----------------------|------------------|
| false | * | * | — | — | — |
| true | content | * | writeFileIfChanged | — | — |
| true | entity | * | ✓ JSON | ✓ | — |
| true | reuse | interfaces | ✓ manifest | — | ✓ |
| true | reuse | classes | **✗ (P0.1 bug)** | ✓ (in-memory) | — |

---

## 6. Задачи (backlog)

### 🔴 P0 — Исправить немедленно

- [ ] **P0.1** Добавить `generationCache.save()` при `needsEntityCacheFallback`
  (`cacheStrategy: 'reuse'` + `modelsMode: 'classes'`)
- [ ] **P0.2** `ReuseStore.readArtifactIfIntegrityOk`: всегда проверять `contentHash`
  независимо от `byteSize`
- [ ] **P0.3** `GenerationCache.load()`: добавить try/catch вокруг `JSON.parse`

### 🟠 P1 — Высокий приоритет

- [ ] **P1.1** `nameKindIndex`: поддержать несколько entries на `name|kind`
  (нужен `Map<string, ManifestArtifact[]>`) для корректной работы с namespace
- [ ] **P1.2** `ReuseStore.save()`: атомарный write (temp file + rename)
- [ ] **P1.3** `ReuseStore.load()`: при bad/v1 manifest — сканировать `artifacts/` и GC orphan-файлы
- [ ] **P1.4** File lock для `ReuseStore` / `GenerationCache` (например, `proper-lockfile`)
- [ ] **P1.5** `GenerationCache` hit: добавить проверку contentHash хотя бы как `cacheDebug`-опцию

### 🟡 P2 — Средний приоритет

- [ ] **P2.1** Расширить whitelist `SCHEMA_HASH_KEYS`: добавить
  `minimum, maximum, pattern, const, default, discriminator, minLength, maxLength, minItems, maxItems`
- [ ] **P2.2** `normalizeSchemaNode`: добавить `visited: Set<schema>` против циклических `$ref`
- [ ] **P2.3** `stableStringify`: сортировать массивы `required` и `enum` перед хешированием
- [ ] **P2.4** `buildOptionsSlice`: включить конфигурацию плагинов (не только имена) в hash
- [ ] **P2.5** `ReuseStore.gc()`: синхронизировать `specItems[].artifactKeys`
- [ ] **P2.6** `GenerationCache`: добавить GC entries (например, по `updatedAt` TTL или явным ключам)
- [ ] **P2.7** Убрать или переписать `validateConsistentCacheSettings`
  (проверять `modelsMode` split, `cacheDebug` — те поля, которые реально могут различаться)
- [ ] **P2.9** `SharedFolderWriter`: либо реализовать `write()` и использовать его,
  либо удалить класс — вынести `lca` как простое поле
- [ ] **P2.10** Удалить или починить `detectCrossSpecDrift` (сейчас dead code)
- [ ] **P2.11** `runPreAnalyze`: передавать `items` в `runCrossSpecAnalysis` для работы
  `detectSharedOutputCollisionRisk`
- [ ] **P2.12** Кэшировать результаты `getOpenApiSpec` между `runPreAnalyze` и `generateSingle`
- [ ] **P2.13** Namespace path: использовать полный relative path, не basename
- [ ] **P2.14** `__shared__` canonical path: включить hash в имя файла
  (`UserDto__ab12.ts`) при наличии нескольких схем

### 🔵 P3 — Низкий приоритет / tech debt

- [ ] **P3.1** Убрать `'core'` из `ArtifactKind` или реализовать поддержку
- [ ] **P3.2** Убрать мёртвое поле `ManifestReference.kind`
- [ ] **P3.3** Исправить hint в `ReuseConflictError` — указывать актуальный `kind`
- [ ] **P3.5** `getManifest()`: возвращать `Readonly<>` или deep clone
- [ ] **P3.6** `replace(/^[IET]/, '')`: заменить на явный список префиксов
- [ ] **P3.8** `GenerationCache`: добавить GC по TTL или явным ключам текущего batch
- [ ] **P3.10** Добавить тесты: LCA edge-cases, `computeStoreRelativeImport`,
  `SharedFolderWriter`, namespace mode, cyclic `$ref`, contentHash integrity

---

## 7. Связанные OpenSpec-спеки

- `openspec/specs/reuse-auto-group-core/spec.md` — SharedFolderWriter + auto-group
- `openspec/specs/pre-analyze-core/spec.md` — `runPreAnalyze` + `CrossSpecAnalyzer`
- `openspec/changes/marauder-v6-core-implementation/specs/reuse-auto-group-core/spec.md`
- `openspec/changes/marauder-v6-core-implementation/specs/pre-analyze-core/spec.md`

---

*Документ описывает состояние кода на момент ревью. При исправлении багов обновите
соответствующие разделы и проставьте ✅ напротив задачи.*
