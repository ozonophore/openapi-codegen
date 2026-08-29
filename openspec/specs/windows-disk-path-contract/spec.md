## Purpose TBD

Disk path strings after `pathHelpers` use `/`; LCA stays slash-form; production refuses drive-root mkdir/write; Git CLI paths are POSIX; snapshot compare normalizes `\n`; test helper retries then ignores `EBUSY`.

## Requirements

### Requirement: Disk strings after pathHelpers use slash
После `joinHelper`, `resolveHelper`, `relativeHelper`, `normalizeHelper` или `dirNameHelper` сравниваемые или сохраняемые строки дисковых путей MUST использовать `/`. Тесты, которые проверяют эти строки, MUST использовать `joinHelper` (или тот же хелпер, который породил значение) и MUST NOT использовать нативный `path.join` как ожидаемое значение.

#### Scenario: Результат хелпера на Windows разделён слешем
- **WHEN** production- или тестовый путь получен через `joinHelper` / `resolveHelper` / `relativeHelper` / `normalizeHelper` / `dirNameHelper` на Windows
- **THEN** строка MUST содержать `/` как разделитель и MUST NOT содержать `\`

#### Scenario: Проверки используют joinHelper
- **WHEN** тест проверяет строку дискового пути, полученную через `pathHelpers`
- **THEN** ожидаемое значение MUST быть собрано через `joinHelper` (или тот же хелпер), не через нативный `path.join`

---

### Requirement: isSubDirectory compares slash disk strings
`isSubDirectory` MUST сравнивать родителя и потомка по строкам дисковых путей из `pathHelpers` (`/`). Он MUST NOT считать слеш-нормализованного потомка лежащим вне слеш-нормализованного родителя только потому, что нативный `path.sep` равен `\`.

#### Scenario: Потомок под родителем при смешанных нативных разделителях
- **WHEN** родитель и потомок обозначают одну иерархию после `resolveHelper` / `relativeHelper`
- **THEN** `isSubDirectory` MUST вернуть true, если потомок — подкаталог, на Windows так же, как на POSIX

---

### Requirement: Production refuses drive-root mkdir and write
Production MUST отказывать в mkdir или write корня диска. Корень диска включает `/`, `D:\` и `C:\` (и эквивалентные формы со слешем после нормализации). Тесты успешной записи MUST использовать настоящий временный каталог. Отдельные тесты MUST ожидать понятную ошибку для `/` и `D:\`.

#### Scenario: Успешная запись использует настоящий временный каталог
- **WHEN** тест записи прогоняет успешный mkdir/write сгенерированного вывода
- **THEN** путь вывода MUST быть настоящим временным каталогом, не `/`

#### Scenario: POSIX-корень отвергается
- **WHEN** production mkdir или write просят использовать `/` как целевой каталог
- **THEN** операция MUST завершиться понятной ошибкой и MUST NOT создавать или писать файлы в корень диска

#### Scenario: Корень диска Windows отвергается
- **WHEN** production mkdir или write просят использовать `D:\` (или `C:\`) как целевой каталог
- **THEN** операция MUST завершиться понятной ошибкой и MUST NOT создавать или писать файлы в корень диска

---

### Requirement: Git CLI paths are POSIX
Пути Git CLI, передаваемые в `git show`, MUST быть POSIX (`test/spec/v3.json`). Они MUST NOT использовать разделители Windows (`test\\spec\\v3.json`).

#### Scenario: Путь спеки относительно репозитория использует слеш
- **WHEN** `readSpecFromGit` загружает `test/spec/v3.json` на Windows
- **THEN** путь в команде Git MUST быть `test/spec/v3.json` и MUST NOT быть `test\\spec\\v3.json`

---

### Requirement: Snapshot compare normalizes newlines
`toMatchSnapshot` MUST нормализовать и expected, и received к `\n` перед сравнением. Это изменение MUST NOT менять EOL файлов генератора.

#### Scenario: Снимок CRLF совпадает с полученным LF
- **WHEN** файл снимка содержит `\r\n`, а полученная строка содержит `\n` с тем же логическим содержимым
- **THEN** `toMatchSnapshot` MUST считать их равными

#### Scenario: EOL генератора не меняется
- **WHEN** генератор пишет файл `.ts`
- **THEN** это изменение MUST NOT переписывать соглашение о конце строк этого файла

---

### Requirement: Test helper retries then ignores EBUSY
Общий тестовый хелпер MUST оборачивать `rmSync` временного каталога: повторная попытка, затем игнорировать `EBUSY`. Это MUST NOT быть изменением production-генератора.

#### Scenario: Очистка временного каталога на Windows получает EBUSY
- **WHEN** тест удаляет временный каталог на Windows и `rmSync` бросает `EBUSY`
- **THEN** хелпер MUST сделать повторную попытку и, если `EBUSY` сохраняется, игнорировать его, не роняя тест

#### Scenario: Production rmdir не меняется
- **WHEN** production-генератор удаляет каталоги
- **THEN** он MUST NOT перенимать тестовую политику игнора `EBUSY`
