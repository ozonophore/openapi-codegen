# Справочник CLI

CLI-бинарник — **`openapi-codegen-cli`** (пакет `ts-openapi-codegen`).

```bash
npx openapi-codegen-cli <command> [options]
```

Семь команд: `generate`, `check-config`, `update-config`, `init`, `preview-changes`, `analyze-diff`, `analyze-usage`.

Быстрый старт: [getting-started.md](getting-started.md).

---

## generate

```bash
openapi-codegen-cli generate --input ./spec.json --output ./dist
openapi-codegen-cli generate --openapi-config ./openapi.config.json
```

| Опция | Короткая | Default | Описание |
|-------|----------|---------|----------|
| `--input` | `-i` | — | OpenAPI spec |
| `--output` | `-o` | — | Output directory |
| `--openapi-config` | `-ocn` | `openapi.config.json` | Config file |
| `--httpClient` | `-c` | `fetch` | `fetch`, `xhr`, `node`, `axios` |
| `--request` | — | — | Custom transport |
| `--customExecutorPath` | — | — | Custom `createExecutorAdapter` |
| `--validationLibrary` | — | `none` | `none`, `zod`, `joi`, `yup`, `jsonschema` |
| `--useHistory` | — | `false` | Diff report annotations |
| `--cache` | — | `false` | Кэш генерации |

HTTP-опции: [request-executor.md](request-executor.md). Полная таблица флагов — [cli-reference.md (EN)](../en/cli-reference.md).

---

## check-config

Проверка схемы + **executor warnings** (non-fatal, с 2.1.0-beta.10).

```bash
openapi-codegen-cli check-config --openapi-config ./openapi.config.json
```

### Warnings → действие

| Предупреждение | Действие |
|----------------|----------|
| `request file not found: …` | Исправить путь transport |
| `customExecutorPath file not found: …` | Исправить путь или `init --requestFormat adapter` |
| `customExecutorPath should export function createExecutorAdapter` | Переименовать экспорт |
| `items[N]: …` | Исправить override в multi-spec |

Полная таблица: [request-executor.md § check-config](request-executor.md#check-config).

---

## update-config

Миграция конфига на последнюю schema version (V6).

```bash
openapi-codegen-cli update-config --openapi-config ./openapi.config.json
```

---

## init

```bash
openapi-codegen-cli init
openapi-codegen-cli init --request ./src/custom/request.ts --requestFormat transport
```

| Опция | Default | Описание |
|-------|---------|----------|
| `--requestFormat` | `transport` | `transport` \| `adapter` \| `executor` |
| `--specs-dir` | `./openapi` | Директория со specs |

См. [request-executor.md § init](request-executor.md#init---requestformat).

---

## preview-changes

Diff без перезаписи текущего output.

```bash
openapi-codegen-cli preview-changes --openapi-config ./openapi.config.json
```

---

## analyze-diff

```bash
openapi-codegen-cli analyze-diff \
  --input ./openapi/current.yaml \
  --compare-with ./openapi/previous.yaml
```

Подтверждение miracles: `"status": "confirmed"` в `report.structural.miracles`.

---

## analyze-usage

```bash
openapi-codegen-cli analyze-usage \
  --sourcePath ./generated/index.ts \
  --projectPath . \
  --check
```

**CI chain:**

```bash
openapi-codegen-cli generate --input ./openapi/spec.yaml --output ./generated
openapi-codegen-cli analyze-usage --sourcePath ./generated/index.ts --projectPath . --check
tsc --noEmit
```

---

## Связанные документы

- [Быстрый старт](getting-started.md)
- [Справочник конфигурации](configuration-reference.md)
- [RequestExecutor hub](request-executor.md)
- [Полный справочник CLI (EN)](../en/cli-reference.md)
