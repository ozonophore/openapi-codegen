## 1. Translate LoggerMessages.ts — header and JSDoc comments

- [x] 1.1 Translate the file-level JSDoc block (lines 2–3): "Константы с текстовыми сообщениями для Logger / Все тексты для логирования должны быть вынесены сюда для централизованного управления" → English
- [x] 1.2 Translate the `LOGGER_ERROR_CODES` JSDoc (line 5): "Коды ошибок CLI для централизованного логирования." → English
- [x] 1.3 Translate the `TLoggerErrorCode` JSDoc (line 20): "Тип кода ошибки CLI." → English
- [x] 1.4 Translate the `LOGGER_ERROR_RECOMMENDATIONS` JSDoc (line 24): "Человекочитаемые рекомендации для пользователя CLI по коду ошибки" → English
- [x] 1.5 Translate the `LOGGER_MESSAGES` JSDoc (line 45): "Централизованные текстовые сообщения для Logger." → English

## 2. Translate LOGGER_ERROR_RECOMMENDATIONS string values

- [x] 2.1 `CONFIG_FILE_MISSING`: translate to English (create/provide config file, use --input/--output)
- [x] 2.2 `CONFIG_FILE_NOT_FOUND_AT`: translate to English (check --openapi-config path, update or create the file)
- [x] 2.3 `NO_OPTIONS_PROVIDED`: translate to English (provide --input and --output parameters)
- [x] 2.4 `CONFIG_VALIDATION_FAILED`: translate to English AND replace "соответствовать схеме V6" → "correspond to the current schema"
- [x] 2.5 `NO_SPEC_FILES_FOUND`: translate to English (ensure .yaml/.yml/.json files exist in the directory)
- [x] 2.6 `NO_VALID_SPEC_FILES_FOUND`: translate to English (check spec format conforms to OpenAPI v2/v3)
- [x] 2.7 `PREVIEW_DIR_EMPTY`: translate to English (run generation first or point to another preview dir)
- [x] 2.8 `PREVIEW_CLEANUP_FAILED`: translate to English (check permissions, remove file locks, clean manually)
- [x] 2.9 `SPEC_FILES_FIND_ERROR`: translate to English (check search glob and filesystem read access)
- [x] 2.10 `PRETTIER_FORMAT_FAILED`: translate to English (check generated fragment syntax and prettierConfigPath)
- [x] 2.11 `ESLINT_FIX_FAILED`: translate to English (verify tsconfigPath, eslintConfigPath, ESLint installation)

## 3. Translate LOGGER_MESSAGES.CONFIG string values

- [x] 3.1 `CONFIG.FILE_NOT_FOUND`: `Отсутствует файл: ${path}` → `File not found: ${path}`
- [x] 3.2 `CONFIG.UPDATING_FAILED`: `Ошибка при обновлении данных конфигурационного файла` → English
- [x] 3.3 `CONFIG.CHECKING_FAILED`: `Ошибка при проверке данных конфигурационного файла` → English
- [x] 3.4 `CONFIG.CONFIG_VALID`: `Параметры конфигурации в файле "${path}" прошли проверку` → English
- [x] 3.5 `CONFIG.CONFIG_UP_TO_DATE`: `Данные в файле "${path}" актуальны` → English
- [x] 3.6 `CONFIG.WARNING_OUTDATED_CONFIG`: `Ваша версия конфигурации устарела и нуждается в обновлении.` → English
- [x] 3.7 `CONFIG.WARNING_DEFAULT_VALUES`: `В вашей конфигурации есть значения по умолчанию, которые можно удалить.` → English

## 4. Add new LOGGER_MESSAGES keys for OpenApiClient warn messages

- [x] 4.1 Add `LOGGER_MESSAGES.GENERATION.AUTO_GROUP_REQUIRES_REUSE_CACHE` key with English text (auto-group requires cacheStrategy: reuse — auto-group is ignored, falling back to copy)
- [x] 4.2 Add `LOGGER_MESSAGES.GENERATION.AUTO_GROUP_LCA_TRIVIAL_FALLBACK` key with English text (auto-group: LCA is trivial, falling back to copy)
- [x] 4.3 Add `LOGGER_MESSAGES.GENERATION.TRAFFIC_SPLITTER_MULTI_ITEM_WARN` key with English text (trafficSplitter is not intended for multi-item configs — file will be written to the output of the first item)
- [x] 4.4 Replace `logger.warn('reuseMode: auto-group требует...')` at `OpenApiClient.ts:315` with `LOGGER_MESSAGES.GENERATION.AUTO_GROUP_REQUIRES_REUSE_CACHE`
- [x] 4.5 Replace `logger.warn('reuseMode: auto-group: LCA...')` at `OpenApiClient.ts:325` with `LOGGER_MESSAGES.GENERATION.AUTO_GROUP_LCA_TRIVIAL_FALLBACK`
- [x] 4.6 Replace `logger.warn('trafficSplitter не предназначен...')` at `OpenApiClient.ts:454` with `LOGGER_MESSAGES.GENERATION.TRAFFIC_SPLITTER_MULTI_ITEM_WARN`

## 5. Add new LOGGER_MESSAGES.CLI keys for index.ts help strings

- [x] 5.1 Add `LOGGER_MESSAGES.CLI.HELP_INPUT_DIR` key: English text for "path to directory with spec files"
- [x] 5.2 Add `LOGGER_MESSAGES.CLI.HELP_INTERACTIVE` key: English text for interactive mode description
- [x] 5.3 Replace Russian string literal at `cli/index.ts:163` with `LOGGER_MESSAGES.CLI.HELP_INPUT_DIR`
- [x] 5.4 Replace Russian string literal at `cli/index.ts:167` with `LOGGER_MESSAGES.CLI.HELP_INTERACTIVE`

## 6. Add new LOGGER_MESSAGES keys for constants.ts dialog labels

- [x] 6.1 Add `LOGGER_MESSAGES.CONFIG.DIALOG_GENERATE_EXAMPLE` key: "Generate example" (was: "Сформировать пример")
- [x] 6.2 Add `LOGGER_MESSAGES.CONFIG.DIALOG_GENERATE_EXAMPLE_HINT` key: English hint (was: "Будет сформирован пример файла конфигурации...")
- [x] 6.3 Add `LOGGER_MESSAGES.CONFIG.DIALOG_OVERWRITE` key: "Overwrite" (was: "Перезаписать")
- [x] 6.4 Add `LOGGER_MESSAGES.CONFIG.DIALOG_OVERWRITE_HINT` key: English hint (was: "Файл конфигурации будет обновлён до актуальной версии")
- [x] 6.5 Add `LOGGER_MESSAGES.CONFIG.DIALOG_DO_NOTHING` key: "Do nothing" (was: "Ничего не делать")
- [x] 6.6 Replace the five Russian string literals in `constants.ts` with corresponding `LOGGER_MESSAGES.CONFIG.*` references

## 7. Verify and test

- [x] 7.1 Run `rg "[а-яА-ЯёЁ]" src/common/LoggerMessages.ts` — confirm zero matches in string values
- [x] 7.2 Run `rg "[а-яА-ЯёЁ]" src/core/OpenApiClient.ts src/cli/index.ts src/cli/checkAndUpdateConfig/constants.ts` — confirm zero Russian runtime strings
- [x] 7.3 Run `tsc --noEmit` — confirm no type errors
- [x] 7.4 Run existing test suite — confirm no regressions in tests that assert on message strings
