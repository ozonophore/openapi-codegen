## Контекст

Точка входа CLI (`src/cli/index.ts`) использует Commander для объявления флагов команды `generate`, после чего выполняется предварительный проход `parseNestedCliOptions`, перехватывающий dot-notation Marauder-флаги (например, `--auto-select.strict`) до того, как их обработает Commander. Zod-схемы в `src/cli/schemas/generate.ts` валидируют и трансформируют итоговые разобранные опции. Логика слияния в `generateCliOverrides.ts` применяет значения CLI поверх загруженного конфига.

Marauder V6 ввёл пять новых root-уровневых полей конфига (`workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze`, `reuseMode`). Ни одно из них сейчас недоступно из CLI — нет флагов Commander, нет Zod-полей и нет покрытия в слое слияния. Пример конфига в `example/` также создан до V6 и не демонстрирует эти опции.

## Цели / Не-цели

**Цели:**
- Зарегистрировать пять новых объявлений Commander `.option()` / `.addOption()` для команды `generate`
- Расширить `MARAUDER_GROUP_KEYS` + `NestedMarauderOptions` для флагов с поддержкой dot-notation (Marauder block-флаги)
- Добавить соответствующие Zod-поля в `generateOptionsBaseSchema` в `src/cli/schemas/generate.ts`
- Покрыть семантику слияния в `mergeGenerateCliOverrides` и `DIRECT_FLAT_CLI_EXCLUDE_KEYS`
- Добавить `example/openapi.marauder.config.json` с демонстрацией всех пяти опций в сценарии multi-spec монорепозитория

**Не-цели:**
- Реализация самих функций Marauder (уже находится в `src/core/`)
- Изменение типов схемы конфига V6 или значений по умолчанию (уже в `COMMON_DEFAULT_OPTIONS_VALUES`)
- Добавление поддержки dot-notation для `--pre-analyze` и `--reuse-mode` (оба скалярные, не block-флаги)

## Решения

### 1. Таксономия флагов: какие флаги становятся Marauder group keys, а какие — скалярными CLI-опциями

`--workspace-report`, `--traffic-splitter` и `--swarm` принимают либо булево сокращение, либо объект с вложенными полями (например, `--workspace-report.format=markdown`). Они следуют тому же паттерну, что `--auto-select` и `--spec-analysis`, и **должны** быть добавлены в `MARAUDER_GROUP_KEYS` + `NestedMarauderOptions`, чтобы `parseNestedCliOptions` перехватывал их и их dot-notation-варианты до Commander.

`--pre-analyze` — чисто булев (нет вложенных полей согласно PDD §5.2), `--reuse-mode` — простой enum. Оба регистрируются напрямую как Commander-опции и добавляются в `generateOptionsBaseSchema` как скаляры — изменений в пре-парсере не требуется.

*Альтернатива:* зарегистрировать все пять как Commander-опции без `parseNestedCliOptions`. Отклонено — dot-notation (`--workspace-report.format=markdown`) будет молча поглощён Commander как неизвестный аргумент.

### 2. Подход к Zod-схеме: отдельные хелперы `*ConfigSchemaOrBoolean` или inline `.union()`

Для block-флагов (`workspaceReport`, `trafficSplitter`, `swarm`) inline `z.union([z.boolean(), z.object({...})])` дублировал бы паттерны, уже реализованные в `autoSelectConfigSchemaOrBoolean`. Следование существующему паттерну сохраняет согласованность файла схемы и позволяет тестировать каждый хелпер независимо.

Для `preAnalyze` → `z.boolean().optional()`, `reuseMode` → `z.enum(['copy', 'auto-group']).optional()`.

### 3. Покрытие слоя слияния

`workspaceReport`, `trafficSplitter`, `swarm` — объектные флаги, сливаемые через `mergeMarauderBlockDeep` (аналогично `autoSelect`, `specAnalysis`). Они добавляются в `DIRECT_FLAT_CLI_EXCLUDE_KEYS`, поскольку являются root-only и обрабатываются путём block-слияния.

`preAnalyze` и `reuseMode` — скалярные переопределения, добавляемые в `GENERATE_CLI_OVERRIDE_KEYS`.

### 4. Пример конфига: новый файл или изменение существующего

`example/openapi.config.json` используется в тестах и CI. Добавление опций Marauder V6 в него может привести к ошибкам тестов, если они ещё не поддерживаются во всех тестовых окружениях. Отдельный файл `example/openapi.marauder.config.json` позволяет избежать изменений в тестируемом файле.

## Риски / Компромиссы

- **Разрастание пре-парсера** → `MARAUDER_GROUP_KEYS` — общая структура; добавления дёшевы, но должны быть согласованы в трёх файлах (`parseNestedCliOptions.ts`, `generate.ts`, `generateCliOverrides.ts`). Пропуск одного файла молча проглотит флаг. Меры: следовать чеклисту из cursor-правила `marauder-cli-wiring.mdc`.
- **Пропуск `DIRECT_FLAT_CLI_EXCLUDE_KEYS`** → Если `workspaceReport`/`trafficSplitter`/`swarm` не исключены из direct flat-mode-валидации, их сложная объектная форма не пройдёт проверку `flatOptionsSchema`. Меры: добавить их в множество рядом с `autoSelect`, `specAnalysis`, `anomalyDetection`.
- **`--traffic-splitter` в single-spec режиме** → PDD §8 указывает, что `trafficSplitter` несовместим с `items: [...]`. CLI не может знать об этом во время разбора флагов; валидация возможна только в runtime (в `generateOpenApiClient`). `superRefine` в Zod для этого ограничения не нужен.
- **JSONC-комментарии в примере** → `JSON.parse` отклоняет комментарии; файл предназначен только для документирования и не должен импортироваться напрямую. Имя `openapi.marauder.config.json` делает это очевидным.

## Открытые вопросы

- Должен ли `--workspace-report` поддерживать dot-notation `--workspace-report.path` в этом изменении, или отложить sub-ключи на следующий этап? (Рекомендация: включить path + format dot-notation, согласованно с другими group-ключами.)
- Нужно ли выводить предупреждение в stderr при использовании `--traffic-splitter` без `items`? (Рекомендация: отложить в слой оркестрации `generateOpenApiClient` — вне рамок этого изменения.)
