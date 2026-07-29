## ADDED Requirements

### Requirement: Configurable layout for classes mode
При `modelsMode === "classes"` генератор MUST поддерживать `models.layout` со значениями `"bundle"` и `"per-file"`. При отсутствии ключа MUST использоваться `"bundle"` (поведение HEAD: один `{outputModels}/models.ts`). Опция MUST НЕ влиять на `modelsMode === "interfaces"` (всегда per-`model.path`).

#### Scenario: default layout is bundle
- **WHEN** `modelsMode: "classes"` и `models.layout` не задан
- **THEN** все definition-модели записываются в `{outputModels}/models.ts`

#### Scenario: explicit bundle
- **WHEN** `modelsMode: "classes"` и `models.layout: "bundle"`
- **THEN** выход эквивалентен default: единый `models.ts`, без обязательных per-schema `{path}.ts`

#### Scenario: interfaces ignores layout
- **WHEN** `modelsMode: "interfaces"` и задан `models.layout: "bundle"`
- **THEN** каждая модель с `path` всё равно пишется в `{outputModels}/{path}.ts`

---

### Requirement: Per-file classes layout preserves model.path
При `modelsMode === "classes"` и `models.layout: "per-file"` генератор MUST записать для каждой definition-модели файл `{outputModels}/{model.path}.ts`, содержащий `*Raw`, `*Dto` и convenience alias для этой схемы. Цикл MUST использовать `model.path` из парсера (включая `$2`/`$3` export names внутри файла).

#### Scenario: two schemas → two files
- **WHEN** спека содержит схемы с путями `schemas/User` и `schemas/Profile`, `modelsMode: "classes"`, `models.layout: "per-file"`
- **THEN** существуют `schemas/User.ts` и `schemas/Profile.ts`, каждый с Raw+Dto этой схемы, и нет обязательного монолитного `models/models.ts` как единственного источника типов

#### Scenario: duplicate alias lives in its path file
- **WHEN** коллизия имён даёт `IFoo$2` и `layout: "per-file"`
- **THEN** символы `$2` эмитятся в файле соответствующего `model.path`, а не только в общем бандле

---

### Requirement: Service and barrel imports follow layout
При `layout: "bundle"` сервисы и index MUST импортировать/реэкспортировать из consolidated `models` модуля (текущее поведение). При `layout: "per-file"` сервисы и index MUST ссылаться на per-path модули (как при `interfaces`), согласованные с `resolveClassesModeTypes` для classes.

#### Scenario: bundle service import
- **WHEN** `modelsMode: "classes"` и `layout: "bundle"`
- **THEN** сгенерированный service импортирует типы моделей из модуля `models` (не из `{path}`)

#### Scenario: per-file service import
- **WHEN** `modelsMode: "classes"` и `layout: "per-file"`
- **THEN** сгенерированный service импортирует типы из per-path модулей моделей

---

### Requirement: ReuseStore enabled for classes per-file only
При `cacheStrategy: "reuse"` и `modelsMode: "classes"` генератор MUST использовать ReuseStore тогда и только тогда, когда `models.layout === "per-file"`. При `layout: "bundle"` MUST сохраняться entity-cache fallback (ReuseStore off).

#### Scenario: per-file reuse path
- **WHEN** multi-item generate с `cacheStrategy: "reuse"`, `modelsMode: "classes"`, `models.layout: "per-file"`
- **THEN** models пишутся через ReuseStore (не через entity-fallback-only путь)

#### Scenario: bundle still disables ReuseStore
- **WHEN** `cacheStrategy: "reuse"`, `modelsMode: "classes"`, `models.layout: "bundle"` (или layout omitted)
- **THEN** ReuseStore для models не используется; применяется entity-cache fallback с persist

---

### Requirement: CLI generate does not override config modelsMode with Commander default
При `generate -ocn <config>` CLI MUST применять `--modelsMode` / `--modelsLayout` только если флаг реально передан в argv. Commander MUST NOT задавать `.default(interfaces)` (или эквивалент) для `--modelsMode` так, чтобы `mergeGenerateCliOverrides` всегда перетирал `models.mode` / `modelsMode` из конфига. Default `interfaces` MUST применяться только на этапе normalizeOptions / schema defaults, когда в merged options mode отсутствует.

#### Scenario: config classes survives -ocn without CLI flag
- **WHEN** конфиг содержит `models.mode: "classes"` (или `modelsMode: "classes"`) и команда `generate -ocn <config>` без `--modelsMode`
- **THEN** генерация идёт в `classes` (появляются BaseDto / `*Raw`+`*Dto`), а не в `interfaces`

#### Scenario: explicit CLI modelsMode still wins
- **WHEN** конфиг содержит `models.mode: "classes"` и CLI передаёт `--modelsMode interfaces`
- **THEN** итоговый mode = `interfaces`

---

### Requirement: Per-file nested models resolve relative core imports
При `models.layout: "per-file"` путь импорта `BaseDto` / `dtoUtils` MUST вычисляться относительно каталога файла модели (`dirName(model.path)`), а не только относительно корня `outputModels`. Bundle (`models/models.ts`) MAY продолжать использовать relative от корня models.

#### Scenario: nested path imports core correctly
- **WHEN** `layout: "per-file"` и `model.path` = `path/alias_request/Simple` (или глубже)
- **THEN** сгенерированный файл импортирует `BaseDto`/`dtoUtils` через relative path с корректным числом `../` до `outputCore` (tsc resolves module)

#### Scenario: top-level per-file model keeps shallow core relative
- **WHEN** `layout: "per-file"` и `model.path` = `User` (без вложенных сегментов)
- **THEN** import core эквивалентен relative от корня models (напр. `../core/BaseDto`)

---

### Requirement: dtoImports and DTO init respect path-aliased export names
При `modelsMode: "classes"` подготовка DTO MUST строить peer-импорты (`dtoImports`) и `new …Dto` / `fromArray` через map `path → exportName/rawName/dtoName` (как `resolveClassesModeTypes`), а не только по «базовому» `imprt.name`. Для `dtoKind !== "class"` (primitive/enum alias) constructor MUST NOT эмитить `new …Dto`. Dictionary of reference MUST маппить values в Dto (аналог array-of-ref); oneOf/anyOf/allOf MAY оставаться raw passthrough до отдельного design.

#### Scenario: colliding schema names use $N export from source path
- **WHEN** две схемы с одним логическим именем дают `IFoo` и `IFoo$2` в разных `model.path`, и потребитель импортирует path файла `$2`
- **THEN** `dtoImports` ссылается на `IFoo$2Raw` / `IFoo$2Dto`, не на `IFooRaw` / `IFooDto`

#### Scenario: primitive alias field does not use new
- **WHEN** свойство — reference на модель с `dtoKind: "alias"` (например type alias string)
- **THEN** `dtoInit` присваивает raw значение без `new …Dto(...)`

#### Scenario: dictionary of DTO references maps values
- **WHEN** свойство `export: "dictionary"` со link-reference на interface-Dto
- **THEN** `dtoInit` преобразует values в экземпляры Dto; `dtoToJSON` сериализует values через `toJSON()`
