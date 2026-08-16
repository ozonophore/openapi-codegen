# 1. Context.ts — обработка путей и кросс-ОС проблемы

Дата: 2026-08-21  
Фокус: `src/core/Context.ts` — как устроены пути, где ломается Windows / POSIX.

---

## Роль Context в пайплайне

Публичная точка входа — `createResolvedContext` (`src/core/createResolvedContext.ts`), тонкая обёртка над `loadOpenApiForContext` (`src/core/specLoad/forContext.ts`):

1. `resolveOpenApiRefsFromFile(input)` — `resolveHelper(cwd, input)` → `SwaggerParser.resolve` → `{ absoluteInput, refs, raw }`.
2. `new Context({ ...props, input: absoluteInput })` — конструктор **без** привязки к парсеру.
3. `context.attachResolvedOpenApi(refs, absoluteInput)` — привязка `$Refs` и построение `virtualFiles`.

Важно: проект вызывает **`SwaggerParser.resolve()`**, не `dereference()`/`bundle()`. Внешние файлы загружены, `$Refs` построен, но `$ref` в дереве **остаются исходными строками** (относительные URI). Context обязан сам канонизировать `$ref` относительно **родительского файла**, прежде чем звать `refs.get()` / `refs.exists()`.

---

## Поля и инварианты путей

| Поле | Назначение | Формат |
|------|-----------|--------|
| `specRoot` | Каталог entry-файла | Абсолютный POSIX (`/`) |
| `entryFile` | Нормализованный абсолютный путь entry | POSIX, без `#fragment` |
| `virtualFiles` | `Map<sourceFile, VirtualFile>` | Ключи — POSIX-абсолютные пути **без fragment** |
| `pathApi` | `isAbsolute`, `normalize`, `dirname`, `resolve`, `relative` | Host `path` или инжект (`path.win32` в тестах) |
| `_root` | Метаданные входа | `path` — как передали; `dirName` — POSIX через `dirNameHelper` |

`VirtualFile`:

- `sourceFile` — абсолютный YAML/JSON, без `#/...`
- `outputFile` — абсолютный `.ts` в `output.outputModels`
- `fragments` — JSON Pointer'ы (`#/components/schemas/Foo`)

**Инвариант Canonical Ref:** до любого path API строка режется через `splitCanonicalRef`. Path API **никогда** не видит `file#pointer` целиком. Это явно проверяется (`src/core/__tests__/Context.canonicalRefLookup.test.ts`).

**Инвариант ключей `virtualFiles`:** все ключи проходят `posixNormalizeSource`:

```
toPosixPath(pathApi.normalize(toPosixPath(file))).replace(/\/+/g, '/')
```

---

## Поток обработки путей

```
constructor
  → attachResolvedOpenApi
    → initializeVirtualFileMap
      → walkSchemaForFragments
        → canonicalizeRef
        → mapSourceToOutput
  → get / exists
    → normalizeRefForLookup → normalizeRef
  → resolveCanonicalRef
```

### 1. Constructor (`Context.ts:71-91`)

**Вход:** `input: string | object`, опционально `pathApi`.

**Утилиты:** `dirNameHelper`, `getFileName` — оба через **host** `path`, не через `pathApi`.

Пример: `input = "/Users/u/proj/api.yaml"` → `_root.path` тот же, `_root.dirName = "/Users/u/proj"`, `_root.fileName = "api"`.

### 2. attachResolvedOpenApi (`Context.ts:96-99`)

Сохраняет `_refs`, вызывает `initializeVirtualFileMap(absoluteEntryFile)`.

`absoluteEntryFile` уже прошёл `resolveHelper` — абсолютный путь с `/` даже на Windows.

### 3. initializeVirtualFileMap (`Context.ts:272-314`)

1. Отрезать fragment от entry: `splitCanonicalRef(entryFile).sourceFile`.
2. `specRoot = posixNormalizeSource(posixDirnameSource(entrySource))`.
3. `entryFile = posixNormalizeSource(entrySource)`.
4. Добавить entry в `virtualFiles`.
5. Для каждого `refPath` из `_refs.paths()` — нормализовать и upsert.
6. Для каждого ключа: `_refs.get(sourceFile)` → `walkSchemaForFragments`.

### 4. walkSchemaForFragments (`Context.ts:241-270`)

Рекурсивный обход. На `$ref` — `canonicalizeRef`, upsert в map, fragment в `Set`.

### 5. canonicalizeRef (`Context.ts:210-230`)

| `$ref` | parent | `sourceFile` | fragment |
|--------|--------|--------------|----------|
| `#/components/schemas/User` | `C:/proj/api.yaml` | `C:/proj/api.yaml` | `#/components/schemas/User` |
| `./schemas/User.yaml#/...` | `C:/proj/api.yaml` | `C:/proj/schemas/User.yaml` | `#/...` |
| `C:\proj\schemas\User.yaml#/...` | `C:/proj/api.yaml` | `C:/proj/schemas/User.yaml` | `#/...` |

LOCAL_FRAGMENT → тот же файл, что parent.  
Внешний ref → `posixResolve(posixDirname(parent), parsed.filePath)`.

### 6. mapSourceToOutput (`Context.ts:232-239`)

```
relative = posixRelative(specRoot, sourceFile)
dir      = posixDirname(relative)
baseName = basename(relative).replace(/\.(yaml|yml|json)$/i, '.ts')
return posixResolve(output.outputModels, dir, baseName)
```

**Дыра:** `basename` импортирован из host `'path'`, не из `pathApi`.

### 7. normalizeRefForLookup (`Context.ts:359-383`)

Порядок:

1. Есть `parentSourceFile` → `normalizeRef(ref, toLookupParent(parent), pathApi)`.
2. Иначе, если есть `entryFile` и тип LOCAL/EXTERNAL → `normalizeRef(ref, entryFile, pathApi)`.
3. Иначе, если есть файловая часть и не HTTP → `joinCanonicalRef({ normalizePath(sourceFile), pointer })`.
4. Иначе вернуть as-is.

`toLookupParent` (`Context.ts:385-394`): absolute или drive → `toPosixPath`; иначе `pathApi.resolve(specRoot, source)`.

### 8. resolveCanonicalRef (`Context.ts:336-357`)

Lookup-ключ → `parseRef` → `posixNormalizeSource(filePath)` → `virtualFiles.get`. Используется в `getType` для import path.

---

## PathApi vs Node path vs pathHelpers

### PathApi (`src/core/utils/pathApi.ts`)

Инжектируемый seam. Production — host `path`. Тесты на darwin передают `path.win32`.

`toPosixPath` — `\ → /`.  
`isWindowsDrivePath` — `/^[A-Za-z]:[\\/]/` (после `:` обязателен `/` или `\`).

Context оборачивает все операции в `posix*` с `toPosixPath` на выходе.

### pathHelpers (`src/common/utils/pathHelpers.ts`)

Используются на **границе spec-load** (`resolveHelper` в `resolveOpenApiRefs.ts:41`) и в CLI/write. Внутри Context — только `dirNameHelper` в конструкторе.

### Смешивание слоёв

| Место | API | Риск |
|-------|-----|------|
| `posix*` методы | `pathApi` + `toPosixPath` | Контролируемо |
| Constructor | `dirNameHelper`, `getFileName` → host `path` | На Windows host корректен; на CI с Windows-фикстурами — нет |
| `mapSourceToOutput` | host `basename` | Не через `pathApi` |
| Spec-load | `resolveHelper` (POSIX output) | Согласовано с `posixNormalizeSource` |

---

## Windows / кросс-платформенные проблемы

### Обработано

| Сценарий | Результат |
|----------|-----------|
| `C:/foo/bar.yaml` vs `C:\foo\bar.yaml` | Оба → `C:/foo/bar.yaml` |
| Mixed `C:\foo/bar\baz.yaml` | → `C:/foo/bar/baz.yaml` |
| `./schemas/User.yaml#/...` при win32 pathApi | OK |
| `#/components/schemas/User` | OK, fallback на `entryFile` |
| HTTP(S) | Lookup as-is; в virtual map не мапятся |
| Map keys `/` vs `\` | Mitigated: всегда `posixNormalizeSource` перед get/set |
| `toPosixPath('C:\\')` | `C:/` — буква диска сохраняется |
| Pointer не попадает в path API | Покрыто тестом-hazard |

### Ломается или рискованно

#### UNC `\\server\share\spec.yaml`

`toPosixPath` → `//server/share/spec.yaml`, затем `path.win32.normalize` + collapse `//` → `/server/share/spec.yaml`. UNC-префикс уничтожен. Ключи не совпадут с тем, что вернёт SwaggerParser.

#### `file://` URLs

`parseRef('file:///C:/foo/bar.yaml')` → `EXTERNAL_FILE`, не URL.  
`posixNormalizeSource` с win32 → мусор вида `./file:/C:/foo/bar.yaml`.  
json-schema-ref-parser имеет `fromFileSystemPath`/`toFileSystemPath`; Context их не использует.

#### Cross-drive `path.relative` (Windows)

`path.win32.relative('C:/a', 'D:/b')` → `D:\b` (абсолютный путь).  
`mapSourceToOutput` получит `generated/models/D:/other/schemas/User.ts`.

#### Case-insensitivity Windows vs `Map`

`C:/Proj/api.yaml` и `c:/proj/api.yaml` — разные ключи. SwaggerParser может капитализировать drive letter; Context case-folding не делает.

#### URL-encoded paths

`./schemas/User%20.yaml` сохраняется as-is. ref-parser декодирует через `decodeURI`; Context — нет. Риск miss при пробелах в путях.

#### Host `path` на POSIX + Windows parent

`toLookupParent` приводит parent к POSIX, но **`pathApi` остаётся host-native**. На macOS `path.isAbsolute('C:/specs/api.yaml') === false`, `path.resolve('C:/specs', './x.yaml')` → `{cwd}/C:/specs/x.yaml`.

Тесты обходят это, инжектируя `path.win32`. Production на darwin с Windows-путями (маловероятно, но CI/fixtures) сломается.

#### `isWindowsDrivePath('C:')` / `C:foo`

Regex требует slash после `:`. Drive-relative `C:foo.yaml` трактуется как EXTERNAL_FILE.

#### HTTP refs в `resolveCanonicalRef`

`parsed.filePath` = undefined → `virtualFiles.get('')` = undefined. Для локальной генерации ожидаемо, но silent.

#### `_refs.get(sourceFile)` в initializeVirtualFileMap

Если parser вернул URL-encoded или native-backslash ключ, а Context нормализует иначе — `catch` молча скипает файл, fragments не собираются.

---

## Что уже сделано хорошо

1. Разделение Canonical Ref и path API — pointer не попадает в `path.normalize`.
2. Инжектируемый `PathApi` — Windows-поведение тестируется на macOS (`path.win32`).
3. Единый POSIX-слой `posix*` в Context.
4. `isWindowsDrivePath` не даёт `/C:/...`.
5. Spec-load boundary: `resolveHelper` нормализует вход до парсера.
6. `virtualFiles` наполняется из `refs.paths()`, не ручным обходом FS.
7. Тесты: `canonicalRef.windows.test.ts`, `Context.canonicalRefLookup.test.ts`.

---

## Рекомендации

1. UNC: распознавать `//server/share` **до** collapse `//`, либо делегировать convertPathToPosix из ref-parser.
2. `file://`: явный reject или decode через URL/`toFileSystemPath`. Сейчас — silent corruption.
3. `basename` в `mapSourceToOutput` — через `pathApi` или POSIX-safe helper.
4. Case-folding ключей на win32 (хотя бы drive letter).
5. `decodeURI` при нормализации source paths — вровень с json-schema-ref-parser.
6. Cross-drive relative: если `path.relative` вернул absolute — не клеить под `outputModels`.
7. Расширить тесты: `getVirtualFiles` / `resolveCanonicalRef` / `mapSourceToOutput` с `path.win32`; UNC; mixed-case; encoded; cross-drive.
8. Два слоя (`pathHelpers` в CLI + `pathApi` в Context) — риск drift; долгосрочно один модуль.

---

## Сводная таблица

| Сценарий | Статус |
|----------|--------|
| `C:/foo` vs `C:\foo` | OK |
| UNC `\\server\share\...` | **Broken** |
| `file://` | **Broken** / unsupported |
| `./schemas/X.yaml#/` | OK (при win32 pathApi) |
| `#/components/...` | OK |
| HTTP(S) | Lookup OK; virtual map N/A |
| Mixed `\` и `/` | OK |
| Native `\` из SwaggerParser | Mitigated |
| Map `/` vs `\` | Mitigated |
| Cross-drive relative | **Broken** output paths |
| Case sensitivity (Win) | **Risk** |
| URL-encoded | **Risk** |
| macOS host + Windows drive parent | **BUG** без инжекта `path.win32` |
