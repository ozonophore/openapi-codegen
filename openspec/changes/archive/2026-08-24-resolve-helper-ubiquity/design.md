## Контекст

`TStrictFlatOptions` несёт путевые поля (`input`, `output`, `cachePath`, `plugins[].path` и ещё 9) как относительные строки — ровно в том виде, в каком пользователь записал их в конфиг. После `resolveGenerationOptions` каждая core-функция вызывает `resolveHelper(process.cwd(), ...)` локально, чтобы получить абсолютный путь. Насчитывается 22 таких вызова в 20+ файлах `src/core/`. Функция `resolveOutputRoot(output)` при этом продублирована в `setupGenerationBatch.ts` и `GenerationBatchSession.ts`.

Точка входа — `OpenApiClient.generate()`. Именно она вызывает `resolveGenerationOptions`, а затем передаёт `items` в сессию. Это единственное место, где можно вставить нормализацию без изменения сигнатур core-функций.

## Goals / Non-Goals

**Goals:**
- Ввести `normalizePathsToAbsolute(result, cwd)` — единственную точку нормализации
- Сделать `src/core/` независимым от `process.cwd()` — каждая core-функция получает уже абсолютные пути
- Удалить дублированную `resolveOutputRoot()` из двух файлов
- Документировать path-поля `TStrictFlatOptions` как «always absolute after normalization»

**Non-Goals:**
- Брендированный тип `AbsolutePath` — конвенция + JSDoc достаточно
- Рефакторинг `common/utils/loadConfigIfExists.ts` — вызывается до options resolve, CWD там законен
- Нормализация путей внутри `GenerationRootOptions` (вложенные объекты `trafficSplitter`, `swarm`, `workspaceReport`)

## Решения

### D1 — `normalizePathsToAbsolute` как отдельная функция, а не часть `resolveGenerationOptions`

`resolveGenerationOptions` — чистая функция (валидация + flatten + defaults). Добавление `process.cwd()` внутрь сломало бы её изолируемость и тестируемость. Отдельная функция `normalizePathsToAbsolute(result, cwd)` принимает `cwd` явным параметром и не читает окружение самостоятельно. Вызывается в `OpenApiClient.generate()` с `process.cwd()` — единственное место, где CWD допустим.

_Альтернатива: внутри resolveGenerationOptions_ — отклонена, нарушает чистоту функции.

### D2 — Нормализация по списку известных path-полей

Path-поля `TStrictFlatOptions` — фиксированный список: `input`, `output`, `outputCore`, `outputModels`, `outputServices`, `outputSchemas`, `cachePath`, `request`, `customExecutorPath`, `prettierConfigPath`, `governanceConfig`, `reportFile`. Плюс `plugins[].path` в массиве. Нормализатор итерирует по всем items и применяет `resolveHelper(cwd, value)` к каждому ненулевому ненулевому строковому полю из списка.

`path.resolve(cwd, absolutePath)` → возвращает `absolutePath` без изменений, поэтому повторное применение к уже абсолютному пути безопасно.

_Альтернатива: рефлексия по суффиксу имени поля_ (`*Path`, `*Output`) — отклонена, хрупко и неявно.

### D3 — Пустая строка и `undefined` не нормализуются

Некоторые поля (`outputCore`, `request` и др.) могут иметь значение `''` (default). `resolveHelper(cwd, '')` → возвращает CWD, что семантически неверно. Нормализатор пропускает значения, для которых `!value` (пустая строка, `undefined`, `null`).

### D4 — Расположение функции: рядом с `resolveGenerationOptions`

`normalizePathsToAbsolute` экспортируется из `src/core/resolveGenerationOptions.ts` — того же файла, что и `resolveGenerationOptions`. Это сохраняет локальность: оба относятся к одному жизненному циклу опций.

## Риски / Компромиссы

- **Двойная нормализация невозможна**: `path.resolve(cwd, absolutePath) === absolutePath`, поэтому если кто-то уже передаёт абсолютный путь — результат корректен.
- **`plugins[].path` — вложенный массив**: требует отдельного прохода; риск пропустить при добавлении нового plugin-поля в будущем. Митигация: тип `PluginConfigEntry` фиксирован, изменение потребует явного обновления нормализатора.
- **`common/` остаётся с CWD**: `loadConfigIfExists` и `format.ts` по-прежнему вызывают `process.cwd()`, но это сознательное исключение (они работают до нормализации).
