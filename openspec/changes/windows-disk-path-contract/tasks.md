## 1. Контракт слеша и LCA

- [x] 1.1 После `pathHelpers` (`joinHelper`, `resolveHelper`, `relativeHelper`, `normalizeHelper`, `dirNameHelper`) сравниваемые/сохраняемые строки дисковых путей используют `/`; тесты проверяют через `joinHelper`, не через нативный `path.join`
- [x] 1.2 LCA в `OutputGroupResolver` MUST NOT конвертироваться обратно в `path.sep` (`\`); сохранить форму со слешем; обновить юнит-тесты

## 2. Места расхождений строк дисковых путей

- [x] 2.1 EntitySkip: сохраняемые/сравниваемые пути файлов кэша и тесты используют `joinHelper` `/`
- [x] 2.2 ProjectProbe: префикс consumer `src` использует строки дисковых путей со слешем (без смеси с нативным `path.sep`); тесты проверяют через `joinHelper`
- [x] 2.3 analyzeUsage Client / Import / Service / rename + `apiImportScope`: сравнивать со `/`; тесты проверяют через `joinHelper`
- [x] 2.4 `isSubDirectory`: сравнивать родителя и потомка, нормализованных к слешу; снять `skip` и исправить юнит-тесты
- [x] 2.5 Проверки листинга generation cache используют `joinHelper`, не нативный `path.join`

## 3. Отказ писать в корень диска

- [x] 3.1 Production MUST отказывать в mkdir/write корня диска (`/`, `D:\`, `C:\`)
- [x] 3.2 Тесты успешной записи используют настоящий временный каталог (не `'/'` как каталог вывода)
- [x] 3.3 Отдельные тесты ожидают понятную ошибку для `/` и `D:\`

## 4. Git, снимки, очистка тестов

- [x] 4.1 Пути Git CLI MUST быть POSIX (`test/spec/v3.json`), не `test\\spec\\v3.json` (`readSpecFromGit`)
- [x] 4.2 `toMatchSnapshot` нормализует и expected, и received к `\n` перед сравнением; не менять EOL файлов генератора
- [x] 4.3 Общий тестовый хелпер для `rmSync` временного каталога: повторная попытка, затем игнорировать `EBUSY`; не изменение production-генератора

## 5. Проверка

- [x] 5.1 Не редактировать `CONTEXT.md`; без новых терминов глоссария; строки дисковых путей — это не Tree `$ref` / `$ref` lookup
- [x] 5.2 Оставить вне скоупа: RefLookup, отсутствующая модель Nested.ts, expandOpenApiRefs, снимки semantic-diff, PathApi
- [x] 5.3 `openspec validate windows-disk-path-contract --strict`

## 6. Leftover: две assertion со слешем

- [x] 6.1 ProjectProbe integration: сравнивать `getFilePath()` с `joinHelper` (`/`), не с `path.join`
- [x] 6.2 generation cache warning: `includes` каталога вывода через `joinHelper`, не через нативный `path.join`
