## ADDED Requirements

### Requirement: Canonical Ref — ключ lookup `$Refs`
Lookup `$ref` MUST переводить (Parent source file, Tree `$ref`) в Canonical Ref, равный ключу SwaggerParser `$Refs` (точная intern-строка файла плюс необязательный Pointer). Переводчик MUST быть одним модулем, которым пользуются Context `get` / `exists` и сбор Canonical Refs. Lookup MUST NOT изобретать второй POSIX «канонический путь», MUST NOT вызывать `path.resolve` / `path.join` / `path.normalize` на строке, в которой ещё есть `#`, и MUST NOT использовать `PathApi`.

#### Scenario: Только Pointer при заданном родителе
- **WHEN** Tree `$ref` равен `#/components/schemas/Foo`, а Parent source file — `/home/dev/api.yaml`
- **THEN** Canonical Ref MUST быть `/home/dev/api.yaml#/components/schemas/Foo` и MUST NOT содержать `#\`

#### Scenario: Только Pointer без родителя берёт Entry file
- **WHEN** Tree `$ref` равен `#/components/schemas/Foo` и вызывающий не передал родителя
- **THEN** Canonical Ref MUST использовать Entry file плюс этот Pointer

#### Scenario: Относительный файл склеивается с родителем, не с корнем спеки
- **WHEN** Tree `$ref` равен `Pet.yaml` или `./Pet.yaml`, а Parent source file — `/home/dev/schemas/Owner.yaml`
- **THEN** Canonical Ref MUST быть intern-ключом для `/home/dev/schemas/Pet.yaml`

---

### Requirement: URI-склейка против intern-таблицы парсера
Относительный и абсолютный файловый Tree `$ref` MUST склеиваться через `new URL` против вручную собранной базы `file://` из Parent source file. Сравнение с `refs.paths()` MUST допускать только орфографию того же открытого файла (percent-encoding, `\` vs `/`, регистр буквы диска). В `refs.get` / `refs.exists` MUST уходить intern-ключ парсера, не ключ сравнения. Файл, которого нет в intern-таблице, MUST NOT подменяться другим файлом с тем же basename и MUST NOT читаться с диска. Удалённый Tree `$ref` `http://` / `https://` MUST возвращаться как в YAML.

#### Scenario: Windows-пути с буквой диска склеиваются на любой ОС процесса
- **WHEN** процесс не Windows, Tree `$ref` равен `./schemas/Pet.yaml`, Parent source file — `C:/proj/api.yaml`
- **THEN** Canonical Ref MUST быть intern-значением `C:/proj/schemas/Pet.yaml` (URI-склейка), а не darwin-относительным мусором

#### Scenario: Tree `$ref` с обратными слешами совпадает с ключом парсера со `/`
- **WHEN** в `refs.paths()` есть `C:/proj/api.yaml`, а Tree `$ref` равен `C:\proj\api.yaml#/components/schemas/Foo`
- **THEN** `get` MUST использовать intern `C:/proj/api.yaml#/components/schemas/Foo`

#### Scenario: Отсутствующий intern-ключ — это не другой Pet.yaml
- **WHEN** в intern-таблице есть `/home/dev/other/Pet.yaml`, но нет `/home/dev/schemas/Pet.yaml`, и Tree `$ref` равен `Pet.yaml` от родителя `/home/dev/schemas/Owner.yaml`
- **THEN** lookup MUST NOT подставить `/home/dev/other/Pet.yaml`; `exists` для этого локального склеенного пути MUST быть false, если файл так и не открывался

---

### Requirement: Жёсткий контракт родителя
Parent source file MUST быть абсолютным путём и MUST NOT содержать Pointer. Относительный файловый Tree `$ref` без родителя MUST завершаться ошибкой контракта (не тихим откатом на Entry file). Context `exists` MUST оставаться строгим: промах intern или промах парсера MUST давать false; неразрешённые `$ref` остаются заботой Spec/strict.

#### Scenario: Относительный Tree `$ref` без родителя
- **WHEN** Tree `$ref` равен `./Pet.yaml` и родитель не передан
- **THEN** lookup MUST бросить ошибку контракта про отсутствующий Parent source file

#### Scenario: В родителе всё ещё есть Pointer
- **WHEN** вызывающий передаёт `/home/dev/api.yaml#/components/schemas/Foo` как Parent source file
- **THEN** lookup MUST бросить ошибку контракта; MUST NOT молча отрезать `#`

#### Scenario: Неразрешённый `$ref` по-прежнему попадает в strict
- **WHEN** включена strict-валидация и `$ref` не резолвится этим lookup
- **THEN** в strict-отчёте MUST фиксироваться issue с кодом `UNRESOLVED_REF`
