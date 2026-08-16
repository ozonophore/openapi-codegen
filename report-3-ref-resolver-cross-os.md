# 3. Класс резолвера `$ref` после SwaggerParser — кросс-ОС дизайн

Дата: 2026-08-21  
Фокус: как писать класс с чистого листа; как решать проблемы путей на разных ОС; роль `pathHelpers.ts`.

---

## Что именно нужно резолвить после SwaggerParser

Проект вызывает **`SwaggerParser.resolve()`**, не `parse()` в одиночку и не `dereference()`/`bundle()`:

```40:57:src/core/specLoad/resolveOpenApiRefs.ts
export async function resolveOpenApiRefsFromFile(input: string): Promise<ResolvedOpenApiFromFile> {
    const absoluteInput = resolveHelper(process.cwd(), input);
    // ...
    const refs = await parser.resolve(absoluteInput);
    const raw = refs.get(absoluteInput);
```

`resolve()` = `parse()` + загрузка внешних файлов. `$Refs` построен, дерево **не развёрнуто**: `$ref` остаются исходными строками.

### Что остаётся в дереве

1. Локальный pointer: `#/components/schemas/Foo`
2. Относительный файл: `./schemas/Pet.yaml`, `../common.yaml`, `Pet.yaml`
3. Absolute file (URI, POSIX slashes): `C:/proj/schemas/Pet.yaml` / `/unix/abs.yaml`
4. File + pointer: `./schemas/Pet.yaml#/definitions/Pet`
5. Remote: `https://example.com/schema.json#/...`
6. Редко: `file:///C:/...`

После `dereference()`/`bundle()` большинство `$ref` исчезает — **не этот случай**.

### Что даёт `$Refs`

| Метод | Поведение |
|-------|-----------|
| `paths()` | Все ключи; для file — POSIX `/` даже на Windows (`convertPathToPosix` внутри ref-parser) |
| `values()` | `{ [posixPath]: parsedObject }` |
| `get(ref)` / `exists(ref)` | Внутри `_resolve()` делает `url.resolve(this._root$Ref.path, path)` — **всегда от root entry**, не от parent-файла в дереве |

Следствие: `refs.get('./schemas/Pet.yaml')` работает относительно **root**.  
`refs.get('Pet.yaml')` из вложенного `Owner.yaml` **не** резолвится от `Owner.yaml`.

Новый класс обязан канонизировать `$ref` относительно **родительского source file**, прежде чем звать `refs.get()`. Это уже делает `Context.normalizeRefForLookup`.

### Почему нельзя слепо использовать Node `path`

| Проблема | Пример |
|----------|--------|
| Host-dependent API | На darwin `path.isAbsolute('C:/a')` → **false** |
| `\` vs `/` | `path.dirname('C:\\proj\\api.yaml')` на darwin → `.` |
| `#` — не path | `path.win32.normalize('C:/a.yaml#/Foo')` → `#\Foo` |
| `$ref` file part = URI | OpenAPI требует POSIX `/` даже на Windows |
| `path.relative` cross-drive | `C:/a` vs `D:/b` → абсолютный `D:\b` |
| Смешение URL и FS | `path.join('http://x', 'y')` |
| Ключи SwaggerParser ≠ host path | `paths()` уже POSIX |

---

## Модель данных

**Имя:** `PostResolveRefResolver` (или `CanonicalRefIndex`).

**Ответственность:** единственный владелец парсинга `$ref`, канонизации FS-путей, индекса `refs.paths()`, ключей для `refs.get`/`exists`.

### Канонический формат ключей

Согласован с существующими тестами (`WINDOWS_FILE = 'C:/proj/api.yaml'`):

| Поле | Формат | Windows | POSIX |
|------|--------|---------|-------|
| `CanonicalSource` | POSIX abs, `\`→`/`, drive `C:/...` | `C:/Users/dev/spec/api.yaml` | `/home/dev/spec/api.yaml` |
| JSON Pointer | `#/...`, только `/` | `#/components/schemas/Foo` | то же |
| `CanonicalRef` | `source + pointer?` | `C:/proj/api.yaml#/components/schemas/Foo` | `/proj/api.yaml#/...` |
| Map key | = `CanonicalSource` без `#` | `C:/proj/schemas/Pet.yaml` | `/proj/schemas/Pet.yaml` |

### Публичный API

```typescript
class PostResolveRefResolver {
  constructor(opts: {
    refs: RefsLike;
    entryFile: CanonicalSource;
    pathApi?: PathApi;
  });

  parseRef(ref: string): ParsedRef;
  resolveAgainstParent(ref: string, parentSource: CanonicalSource): CanonicalRef;
  toCanonicalSource(raw: string): CanonicalSource;
  toLookupKey(ref: string, parentSource?: CanonicalSource): CanonicalRef;
  lookup(ref: string, parentSource?: CanonicalSource): unknown;
  exists(ref: string, parentSource?: CanonicalSource): boolean;
  toOutputRelative(source: CanonicalSource): string;
}
```

---

## Инварианты (MUST)

1. `splitCanonicalRef` / `parseRef` — **до** любого `path.*` на полной строке.
2. JSON Pointer никогда не проходит через `normalize` / `join` / `relative` / `resolve`.
3. Ключ `virtualFiles` и ключ для `refs.get` — один и тот же `CanonicalSource`.
4. Relative `$ref` резолвится от `dirname(parentSource)`, не от root.
5. `refs.get(key)` получает уже канонический ключ.
6. Drive-letter на non-Windows host — через `isWindowsDrivePath()` + `pathApi.isAbsolute()`, не только `path.isAbsolute()`.
7. Remote `http(s)://` — не канонизировать через filesystem.
8. Case policy одинакова при построении index и при lookup (Windows: хотя бы drive letter).
9. `refs.paths()` прогоняется тем же normalize, что resolved paths.
10. Если нужен re-serialize в OpenAPI — POSIX relative URI, не OS-native path.
11. Fragment никогда не идёт в `pathHelpers.normalizeHelper`.
12. Не смешивать URL и filesystem одним API.

---

## Как решать проблемы ОС

### 1. Разделители `\` vs `/`

File part → `toPosixPath()` до и после `pathApi.*`. Финальный ключ только с `/`.

- **pathHelpers:** все функции делают `.replace(REGEX_BACKSLASH, '/')` — OK для **output**, но host `path`, не injectable.
- **PathApi + toPosixPath** — предпочтительно для resolver.

Примеры:

- SwaggerParser: `C:\proj\api.yaml` → `C:/proj/api.yaml`
- YAML `$ref`: `./schemas\Pet.yaml` → `C:/proj/schemas/Pet.yaml`

### 2. Drive letter `C:`

`isWindowsDrivePath()` + `pathApi` = **`path.win32` даже в тестах на darwin**.

pathHelpers на darwin: `path.join('C:/a','b')` → `C:/a/b` (случайно OK), но `path.dirname('C:\\a\\b')` → `.` (FAIL). **Не полагаться на pathHelpers для `\` Windows paths на CI.**

Если в production-классе parent/ref содержит drive — выбирать `path.win32` независимо от host OS.

### 3. UNC `\\server\share`

`path.win32.isAbsolute('\\\\server\\share\\f.yaml')` → true. После POSIX → `//server/share/f.yaml`.

`isWindowsDrivePath` UNC **не** покрывает. Нужен `pathApi.isAbsolute` или regex `^//|^\\\\`.

`normalizePath` сейчас collapse `//` → `/` — **запретить** для UNC.  
pathHelpers без `path.win32` на Linux UNC не absolute.

### 4. `file://`

Layer 1: если `ref.startsWith('file://')` — парсить как URL (`new URL` / ref-parser `toFileSystemPath`), извлечь path, затем Layer 2.

Текущий `parseRef` обрабатывает только `http(s)`. **Не использовать pathHelpers** для `file://`.

### 5. Relative `./` `../`

`pathApi.resolve(parentDir, filePath)` — как сейчас `resolveRefPath`.

`resolveHelper` резолвит от **cwd**, не от parent file — **не подходит** для `$ref`.

Пример: parent `C:/proj/api.yaml`, ref `../common/Foo.yaml` → `C:/common/Foo.yaml`.

### 6. Local `#/pointer`

`RefType.LOCAL_FRAGMENT` → `sourceFile = parentSource`, fragment как есть.

Пример: parent `C:/proj/api.yaml`, ref `#/components/schemas/Foo`  
→ `C:/proj/api.yaml#/components/schemas/Foo`

### 7. `http(s)`

Не трогать path API. Ключ = original URL. `normalizePath` уже passthrough.

### 8. `path.relative` across Windows drives

Если результат `relative` абсолютный (`isWindowsDrivePath` / `isAbsolute`) — **не** добавлять `./`.

Дыра в `relativeHelper`:

```13:37:src/common/utils/pathHelpers.ts
    if (relativePath.startsWith('/')) {
        return relativePath;
    }
    if (relativePath.startsWith('.')) {
        return relativePath;
    }
    return `./${relativePath}`;  // D:/b/f.yaml → ./D:/b/f.yaml — BUG
```

Для cross-drive: вернуть absolute POSIX as-is.

### 9. Case sensitivity

Windows: единая нормализация (lowercase drive / optional case-fold ключа Map).  
POSIX: case-sensitive.  
Одинаково при `attach` и при lookup.

### 10. Matching SwaggerParser paths → canonical keys

При старте:

```
for (p of refs.paths('file')) {
  index.set(toCanonicalSource(p), p)
}
```

`toCanonicalSource` = тот же пайплайн, что `posixNormalizeSource` в Context.

### 11. Fragments vs `path.normalize`

Строго `splitCanonicalRef` first.  
`normalizeHelper` на полном ref — запрещён.

### 12. Mixing URL and filesystem

Три слоя (ниже). Никогда: `path.join(baseUrl, ref)`, `normalizeHelper('https://...')`, `resolveHelper` для `$ref` без parent.

---

## Оценка pathHelpers.ts

Пользовательские утилиты — `dirNameHelper`, `joinHelper`, `relativeHelper`, `resolveHelper`, `normalizeHelper`. Все: native `path.*` + замена `\` → `/`.

| Функция | Windows OK? | Дыры |
|---------|-------------|------|
| `dirNameHelper` | Частично | `\` paths на darwin → `.`; нет injection |
| `joinHelper` | Частично | `C:/a`+`b` на darwin OK; UNC / `file://` нет |
| `relativeHelper` | **Нет (cross-drive)** | `./D:/...`; тесты только POSIX |
| `resolveHelper` | Для cwd+segments OK | не знает parent `$ref`; host-only |
| `normalizeHelper` | OK для pure paths | **смертелен** с `#` |

### Сравнение с PathApi

| | pathHelpers | PathApi |
|--|-------------|---------|
| Injectable | ❌ host only | ✅ `path.win32` на darwin |
| Scope | CLI, write, cache, FS | Canonical ref pipeline |
| `toPosixPath` / `isWindowsDrivePath` | ❌ | ✅ |
| Pointer-safe | ❌ | ✅ (callers split first) |
| Parent-relative `$ref` | ❌ (cwd) | ✅ `resolveRefPath` |

**Вывод:** pathHelpers — удобный POSIX-output слой для codegen/CLI (`WriteClient`, imports, `resolveOpenApiRefsFromFile`). **Недостаточны как единственный слой** для `$ref` resolver. Нужен PathApi + URI layer (уже есть в `src/core/utils/`).

`expandOpenApiRefsForSemanticDiff.ts` — антипример: свой parse/normalize через `pathHelpers` без PathApi.

Как использовать pathHelpers в новом классе:

| Задача | pathHelpers? |
|--------|----------------|
| Канонизация `$ref` | Нет — PathApi |
| Lookup в `$Refs` | Нет |
| Output-relative путь `.ts` импорта | Да, **после** фикса cross-drive в `relativeHelper` |
| CLI / запись файлов | Да |
| `file://` / UNC / HTTP | Нет |

---

## Рекомендуемая архитектура слоёв

```
┌─────────────────────────────────────────────┐
│ Layer 1: URI / Ref parse (zero filesystem) │
│ splitCanonicalRef, parseRef, RefType        │
│ JSON Pointer — отдельно                     │
└──────────────────┬──────────────────────────┘
                   │ sourceFile only
┌──────────────────▼──────────────────────────┐
│ Layer 2: FS canonicalize (injected PathApi) │
│ normalizePath, resolveRefPath               │
│ toPosixPath, isWindowsDrivePath             │
│ win32 vs posix выбирается по форме пути     │
└──────────────────┬──────────────────────────┘
                   │ CanonicalSource
┌──────────────────▼──────────────────────────┐
│ Layer 3: Swagger index + lookup             │
│ refs.paths() → Map                          │
│ toLookupKey → refs.get / exists             │
└─────────────────────────────────────────────┘
```

### Почему инъекция PathApi лучше голых pathHelpers

1. Тесты Windows на darwin: `pathApi: path.win32`.
2. Единый контракт с уже существующим `normalizeRef` / `parseRef`.
3. pathHelpers привязан к `process.cwd()`; refs резолвятся от parent file.
4. Recording-тесты доказывают: path API не видит `#`.

### Как тестировать без реального Windows

- Unit: `path.win32` + константы `C:/proj/...` (как `canonicalRef.windows.test.ts`).
- Integration: mock `RefsLike` с Windows keys (`Context.canonicalRefLookup.test.ts`).
- Property: `splitCanonicalRef(joinCanonicalRef(x))` ≈ x.
- Hazard: normalize полного ref уничтожает pointer.
- Cross-drive: `toOutputRelative` с `path.win32.relative('C:/a','D:/b/f')`.
- Регрессия: darwin host + Windows drive parent + relative `$ref` (сейчас BUG).

---

## Минимальный скелет

Композиция существующих `core/utils/*`, не третий парсер.

```typescript
import { splitCanonicalRef } from './canonicalRef';
import { parseRef } from './parseRef';
import { normalizePath } from './normalizePath';
import { resolveRefPath } from './resolveRefPath';
import { createNormalizedRef } from './createNormalizedRef';
import { defaultPathApi, type PathApi, toPosixPath, isWindowsDrivePath } from './pathApi';

export class PostResolveRefResolver {
  private readonly pathApi: PathApi;
  private readonly entryFile: string;
  private readonly fileIndex = new Map<string, string>();

  constructor(
    private readonly refs: { paths: Function; get: Function; exists: Function },
    entryFile: string,
    pathApi: PathApi = defaultPathApi,
  ) {
    this.pathApi = pathApi;
    this.entryFile = this.toCanonicalSource(entryFile);
    this.buildIndex();
  }

  toCanonicalSource(sourceFile: string): string {
    return normalizePath(splitCanonicalRef(sourceFile).sourceFile, this.pathApi);
  }

  resolveAgainstParent(ref: string, parentSource: string): string {
    const parent = this.toCanonicalSource(parentSource);
    const parsed = parseRef(ref, this.pathApi);
    const resolved = resolveRefPath(parsed, parent, this.pathApi);
    return createNormalizedRef(parsed, normalizePath(resolved, this.pathApi));
  }

  toLookupKey(ref: string, parentSource?: string): string {
    return this.resolveAgainstParent(ref, parentSource ?? this.entryFile);
  }

  lookup(ref: string, parentSource?: string) {
    return this.refs.get(this.toLookupKey(ref, parentSource));
  }

  private buildIndex(): void {
    for (const p of this.refs.paths('file')) {
      this.fileIndex.set(this.toCanonicalSource(p), p);
    }
  }
}
```

Дополнить (то, чего нет в текущем коде):

- Выбор `path.win32`, если `isWindowsDrivePath(entry|parent|ref)`.
- UNC: не collapse `//`.
- `file://` в Layer 1.
- Cross-drive guard в `toOutputRelative`.
- Одинаковый case policy для index и lookup.

---

## Чего НЕ делать

1. `path.normalize($ref)` на строке с `#`.
2. `refs.get(rawTreeRef)` без parent-canonicalization — сломает nested `Pet.yaml` из `Owner.yaml`.
3. pathHelpers как единственный слой для ref lookup.
4. `path.posix` для Windows drive paths — `posix.isAbsolute('C:/a') === false`.
5. Host `path` в CI для `\` Windows fixtures — dirname → `.`.
6. Третий parse/normalize (как semantic-diff expand).
7. Считать `resolve()` = dereference — walker по `$ref` обязателен.
8. Разные normalize-пайплайны для map keys и lookup keys.
9. Добавлять `./` к absolute cross-drive result.

---

## Связь с текущим Context

### Переиспользовать

| Модуль | Роль |
|--------|------|
| `canonicalRef.ts` | URI split/join |
| `parseRef.ts` | классификация |
| `resolveRefPath.ts` | parent-relative resolve |
| `normalizePath.ts` | FS canonical source |
| `normalizeRef.ts` | полный pipeline → lookup key |
| `createNormalizedRef.ts` | склейка |
| `pathApi.ts` | injectable seam |

### Вынести из Context в класс

- `canonicalizeRef`
- `normalizeRefForLookup`
- `toLookupParent`
- `posixNormalizeSource` / `posixDirnameSource` / `posixResolve` / `posixRelative`
- ref-часть `initializeVirtualFileMap`
- `resolveCanonicalRef`

### Оставить в Context

- plugins, prefix, sortByRequired, output paths
- тонкая делегация: `get()` → `resolver.lookup()`
- `_root` для `fileName()`

`dirNameHelper(input)` в конструкторе Context — только display root. Со временем заменить на `pathApi.dirname` + `toPosixPath`.

---

## Примеры lookup-ключей

| Сценарий | `$ref` в дереве | Parent | Ключ для `refs.get` |
|----------|-----------------|--------|---------------------|
| Local pointer | `#/components/schemas/Foo` | `C:/proj/api.yaml` | `C:/proj/api.yaml#/components/schemas/Foo` |
| Relative file | `./schemas/Pet.yaml` | `C:/proj/api.yaml` | `C:/proj/schemas/Pet.yaml` |
| Nested relative | `Pet.yaml` | `C:/proj/schemas/Owner.yaml` | `C:/proj/schemas/Pet.yaml` |
| Absolute URI | `C:/other/shared.yaml#/defs/X` | любой | `C:/other/shared.yaml#/defs/X` |
| POSIX | `#/components/schemas/Foo` | `/home/dev/api.yaml` | `/home/dev/api.yaml#/components/schemas/Foo` |
| Remote | `https://ex.com/oas.json#/...` | — | as-is |
| `refs.paths()[i]` | — | — | POSIX slashes от parser |

---

## Итог

Писать класс как **композицию** `core/utils/*` + **PathApi injection**.  
pathHelpers — только для output-relative путей codegen (после фикса cross-drive), **не** как слой канонизации `$ref`.

Минимальный diff, максимальная совместимость с `canonicalRef.windows.test.ts` и `Context.canonicalRefLookup.test.ts`.

Обязательные доработки относительно текущего кода, иначе класс унаследует баги:

1. pathApi по форме пути (drive → win32), не по OS процесса.
2. UNC без потери `//`.
3. `file://` в URI-слое.
4. Guard на `path.relative` между дисками.
5. Единый case policy для Windows keys.
