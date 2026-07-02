## Использование

CLI инструмент поддерживает семь команд: `generate`, `check-config`, `update-config`, `init`, `preview-changes`, `analyze-diff` и `analyze-usage`.

### Команда: `generate`

Генерирует TypeScript клиент на основе спецификаций OpenAPI.

**Базовое использование:**
```bash
openapi generate --input ./spec.json --output ./dist
```

**Все доступные опции:**

| Опция | Короткая | Тип | По умолчанию | Описание |
|-------|----------|-----|--------------|----------|
| `--input` | `-i` | string | - | Спецификация OpenAPI (путь, URL или строковое содержимое) - **обязательно** |
| `--output` | `-o` | string | - | Выходная директория - **обязательно** |
| `--openapi-config` | `-ocn` | string | `openapi.config.json` | Путь к файлу конфигурации |
| `--outputCore` | `-oc` | string | `{output}` | Выходная директория для core файлов |
| `--outputServices` | `-os` | string | `{output}` | Выходная директория для сервисов |
| `--outputModels` | `-om` | string | `{output}` | Выходная директория для моделей |
| `--outputSchemas` | `-osm` | string | `{output}` | Выходная директория для схем |
| `--httpClient` | `-c` | string | `fetch` | HTTP клиент для генерации: `fetch`, `xhr`, `node`, или `axios` |
| `--useOptions` | - | boolean | `false` | Использовать опции вместо аргументов |
| `--useUnionTypes` | - | boolean | `false` | Использовать union типы вместо enums |
| `--excludeCoreServiceFiles` | - | boolean | `false` | Исключить генерацию core и сервисных файлов |
| `--request` | - | string | - | Путь к пользовательскому файлу запросов |
| `--customExecutorPath` | - | string | - | Путь к пользовательскому модулю `createExecutorAdapter` |
| `--interfacePrefix` | - | string | `I` | Префикс для интерфейсов моделей |
| `--enumPrefix` | - | string | `E` | Префикс для enum моделей |
| `--typePrefix` | - | string | `T` | Префикс для type моделей |
| `--useCancelableRequest` | - | boolean | `false` | Использовать отменяемый promise как тип возврата |
| `--sortByRequired` | `-s` | boolean | `false` | Использовать расширенную стратегию сортировки для аргументов функций |
| `--useSeparatedIndexes` | - | boolean | `false` | Использовать отдельные index файлы для core, models, schemas и services |
| `--strict-openapi` | - | boolean | `false` | Включить строгую диагностику OpenAPI и завершать генерацию при strict-ошибках |
| `--fail-on-governance-errors` | - | boolean | `false` | Прерывать генерацию при ошибках governance (требует `--strict-openapi`; ключ конфига: `failOnGovernanceErrors`) |
| `--report-file` | - | string | `./.openapi-codegen-reports/openapi-report.json` | Путь к JSON-файлу strict-отчета по диагностике OpenAPI |
| `--governance-config` | - | string | - | Путь к JSON-файлу правил governance |
| `--logLevel` | `-l` | string | `error` | Уровень логирования: `info`, `warn`, или `error` |
| `--logTarget` | `-t` | string | `console` | Цель логирования: `console` или `file` |
| `--validationLibrary` | - | string | `none` | Библиотека валидации для генерации схем: `none`, `zod`, `joi`, `yup`, или `jsonschema` |
| `--emptySchemaStrategy` | - | string | `keep` | Стратегия для пустых схем: `keep`, `semantic`, или `skip` |
| `--modelsMode` | - | string | `interfaces` | Режим генерации моделей: `interfaces` или `classes` |
| `--useHistory` | - | boolean | `false` | Применять diff-отчёт при генерации |
| `--diffReport` | - | string | `./.openapi-codegen-reports/openapi-diff-report.json` | Путь к diff-отчёту |
| `--prettierConfigPath` | - | string | - | Путь к файлу конфигурации Prettier; если файл существует, сгенерированный код форматируется по нему, иначе используются встроенные настройки |
| `--tsconfigPath` | - | string | - | Путь к `tsconfig.json` для пакетного ESLint `--fix` после генерации (нужен `--eslintConfigPath`) |
| `--eslintConfigPath` | - | string | - | Путь к конфигу ESLint для пакетного `--fix` после генерации (нужен `--tsconfigPath`) |
| `--cache` | - | boolean | `false` | Включить кэш генерации (по умолчанию кэш выключен) |
| `--cachePath` | - | string | `.openapi-codegen-store` | Путь к store кэша (относительно output для `entity`; корень global store для `reuse`) |
| `--cacheStrategy` | - | string | из конфига | Стратегия кэша: `entity`, `reuse` или `content` (без флага сохраняется значение из конфига) |
| `--reuseOnConflict` | - | string | из конфига | Политика конфликтов reuse store: `fail` или `namespace` (при `cacheStrategy: "reuse"`) |
| `--cacheDebug` | - | boolean | `false` | Показывать debug-логи cache hit/miss |
| `--auto-select` | - | boolean \| object | `false` | Проектно-зависимый выбор HTTP-клиента и библиотеки валидации (*preview*) |
| `--spec-analysis` | - | boolean \| object | `false` | Анализ качества OpenAPI spec во время генерации (*preview*) |
| `--anomaly-detection` | - | boolean \| object | `false` | Устаревший alias для `--spec-analysis` |

**Marauder preview flags (dot-notation):** `--auto-select`, `--auto-select.strict`, `--spec-analysis.fail-on-high`, inline JSON (`--auto-select='{"strict":true}'`). Обрабатываются до Commander; см. [Marauder user guide](../MARAUDER_USER_GUIDE.md).

**Примеры:**
```bash
# Базовая генерация
openapi generate --input ./spec.json --output ./dist

# С пользовательским HTTP клиентом
openapi generate --input ./spec.json --output ./dist --httpClient axios

# С файлом конфигурации
openapi generate --openapi-config ./my-config.json

# Со всеми опциями через CLI
openapi generate \
  --input ./spec.json \
  --output ./dist \
  --httpClient fetch \
  --useOptions \
  --useUnionTypes \
  --logLevel info
```

### Команда: `check-config`

Проверяет структуру и значения файла конфигурации.

**Использование:**
```bash
openapi check-config
openapi check-config --openapi-config ./custom-config.json
```

**Опции:**
- `--openapi-config` / `-ocn` - Путь к файлу конфигурации (по умолчанию: `openapi.config.json`)

### Команда: `update-config`

Обновляет файл конфигурации до последней поддерживаемой версии схемы.

**Использование:**
```bash
openapi update-config
openapi update-config --openapi-config ./custom-config.json
```

**Опции:**
- `--openapi-config` / `-ocn` - Путь к файлу конфигурации (по умолчанию: `openapi.config.json`)

### Команда: `init`

Генерирует шаблон файла конфигурации.

**Использование:**
```bash
# Генерация шаблона с настройками по умолчанию
openapi init

# Пользовательское имя файла конфигурации
openapi init --openapi-config ./my-config.json

# Явно указать директорию со спецификациями OpenAPI
openapi init --specs-dir ./openapi
```

**Опции:**
- `--openapi-config` / `-ocn` - Путь к выходному файлу конфигурации (по умолчанию: `openapi.config.json`)
- `--specs-dir` / `-sd` - Директория с файлами OpenAPI спецификаций (по умолчанию: `./openapi`)
- `--request` - Путь к пользовательскому request-файлу
- `--requestFormat` - Формат scaffold при `--request`: `transport` | `adapter` | `executor` (по умолчанию: `transport`)
- `--useCancelableRequest` - Включить генерацию cancelable request
- `--useInteractiveMode` - Включить интерактивный режим настройки

### Команда: `preview-changes`

Показывает различия между уже сгенерированным кодом и новым результатом генерации без перезаписи текущей директории generated-кода.

**Использование:**
```bash
openapi preview-changes
openapi preview-changes --openapi-config ./custom-config.json
```

**Опции:**
- `--openapi-config` / `-ocn` - Путь к файлу конфигурации (по умолчанию: `openapi.config.json`)
- `--generated-dir` / `-gd` - Директория с текущим generated-кодом (по умолчанию: `./generated`)
- `--preview-dir` / `-pd` - Временная директория для preview-генерации (по умолчанию: `./.ts-openapi-codegen-preview-changes`)
- `--diff-dir` / `-dd` - Директория для diff-отчетов (по умолчанию: `./.ts-openapi-codegen-diff-changes`)

### Команда: `analyze-diff`

Анализирует изменения между двумя версиями OpenAPI и формирует JSON‑отчет.

**Использование:**
```bash
openapi analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml
openapi analyze-diff --input ./openapi/spec.yaml --git HEAD~1
```

**Опции:**
- `--input` / `-i` - Путь к текущей спецификации OpenAPI (обязательно)
- `--compare-with` - Путь к предыдущей спецификации (приоритетнее `--git`, если указаны оба)
- `--git` - Git ref для чтения предыдущей версии спецификации (например, `HEAD~1`)
- `--output-report` - Путь для сохранения diff‑отчёта (по умолчанию: `./.openapi-codegen-reports/openapi-diff-report.json`)
- `--openapi-config` / `-ocn` - Путь к файлу конфигурации (по умолчанию: `openapi.config.json`); v2-хуки плагинов читают `plugins` из этого файла
- `--governance-config` - Путь к JSON-файлу правил governance
- `--strict-plugin-mode` - Завершать с ошибкой при исключении в хуке плагина (по умолчанию: лог и продолжение)
- `--ci` - Код выхода 1 при ошибках governance
- `--allow-breaking` - Разрешить breaking changes в проверках governance

**Хуки плагинов (v2):** укажите пути к модулям в `plugins` внутри `openapi.config.json`. См. [Plugin API v2 (RFC)](plugin-api-v2.md).

#### Miracles и подтверждение

В diff‑отчёте unified v2.0.0 может быть раздел `structural.miracles` с обнаруженными переименованиями/коэрсингом типов. В генерации применяются только подтверждённые записи.

**Как подтверждать чудеса:**
1. Запустите `analyze-diff` и откройте отчёт (по умолчанию: `./.openapi-codegen-reports/openapi-diff-report.json`).
2. Найдите нужную запись в `structural.miracles`.
3. Измените `"status": "auto-generated"` на `"status": "confirmed"` и закоммитьте отчёт.

Пример (фрагмент):
```json
{
  "structural": {
    "miracles": [
      {
        "oldPath": "$.components.schemas.User.properties.user_name",
        "newPath": "$.components.schemas.User.properties.userName",
        "type": "RENAME",
        "confidence": 0.85,
        "status": "confirmed"
      }
    ]
  }
}
```

### Команда: `analyze-usage`

Анализирует, как TypeScript consumer-проект использует экспорты generated API, и формирует JSON-отчёт. Импорты резолвятся **path-based** от `--sourcePath`: любой import, который через TypeScript module resolution попадает в entry-файл generated API или файл в его директории, считается API-импортом. Поддерживаются aliases вроде `@my-org/api`, если они резолвятся в этот путь.

**Использование:**
```bash
openapi analyze-usage --sourcePath ./generated/index.ts --projectPath . --tsconfigPath ./tsconfig.json
openapi analyze-usage --sourcePath ./src/api/index.ts --projectPath . --output ./api-report.json --check
```

**Опции:**
- `--sourcePath` / `-s` - Путь к entry-файлу сгенерированного API (обязательно)
- `--projectPath` / `-p` - Корневая директория consumer TypeScript-проекта (обязательно)
- `--tsconfigPath` / `-t` - Опциональный путь к `tsconfig.json`
- `--output` / `-o` - Путь к выходному JSON-отчету (по умолчанию: `./.openapi-codegen-reports/openapi-usage-report.json`)
- `--check` / `-c` - CI-режим: завершает команду с кодом `1`, если найдены несоответствия уровня ERROR
- `--diff-report` - Путь к JSON `analyze-diff` для проверки RENAME miracles против кода потребителя

Команда выводит сводку в консоль и сохраняет JSON-отчёт с найденными проблемами и метрикой покрытия.

Сканируются только файлы `{projectPath}/src/**/*.{ts,tsx}`; код вне `src/` игнорируется.

### Единая CI-цепочка

```bash
# 1. Spec delta + governance (unified diff report v2.0.0)
openapi analyze-diff \
  --input ./openapi/spec.yaml \
  --compare-with ./openapi/spec.base.yaml \
  --governance-config ./governance.json \
  --ci

# 2. Generate со strict diagnostics + governance gate
openapi generate \
  --openapi-config ./openapi.config.json \
  --strict-openapi \
  --governance-config ./governance.json \
  --fail-on-governance-errors

# 3. Проверка consumer (опционально — cross-check RENAME miracles)
openapi analyze-usage \
  --sourcePath ./generated/index.ts \
  --projectPath . \
  --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json

# 4. Typecheck
tsc --noEmit
```

Рекомендуемая минимальная цепочка после generate:
```bash
openapi generate --input ./openapi/spec.yaml --output ./generated
openapi analyze-usage --sourcePath ./generated/index.ts --projectPath . --check
tsc --noEmit
```
