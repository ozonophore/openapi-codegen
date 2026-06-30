# OpenAPI Typescript Codegen

[![NPM][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Downloads][coverage-image]][coverage-url]
[![TypeScript][typescript-image]][typescript-url]
[![CI][CI-image]][CI-url]
[![ISSUES][issues-image]][issues-url]
[![issues-pr][issues-pr-image]][issues-pr-url]
[![issues-pr-closed][issues-pr-closed-image]][issues-pr-closed-url]
[![stars-closed][stars-image]][stars-url]
![librariesio-image]
![lines-image]
![Minimum node.js version](https://badgen.net/npm/node/next)

> Node.js библиотека, которая генерирует клиенты Typescript на основе спецификации OpenAPI.

## Почему?
- Интерфейс ❤️ OpenAPI, но мы не хотим использовать JAVA codegen в наших сборках
- Быстрый, легкий, надежный и не зависящий от фреймворка. 🚀
- Поддерживает генерацию клиентов TypeScript
- Поддерживает генерацию http-клиентов fetch, XHR, Node.js и axios
- Поддерживает спецификации OpenAPI версии 2.0 и 3.0
- Поддерживает файлы JSON и YAML для ввода
- Поддерживает генерацию через CLI, Node.js и NPX
- Поддерживает tsc и @babel/plugin-transform-typescript
- Поддерживает кастомизацию имен моделей
- Поддерживает внешние ссылки с помощью [`swagger-parser`](https://github.com/APIDevTools/swagger-parser/)
- Поддерживает strict-диагностику OpenAPI с JSON-отчетом (`--strict-openapi`, `--report-file`)
- Поддерживает плагины генератора (`plugins`), включая встроенный `x-typescript-type`
- Поддерживает генерацию бинарных request/response (`format: binary` -> `Blob`)
- Поддерживает opt-in кэш генерации и инкрементальную запись (`--cache`, `--cachePath`, `--cacheStrategy`, `--cacheDebug`)
- Сгенерированные клиенты используют `RequestExecutor` + `createClient` — см. [RequestExecutor hub](docs/ru/request-executor.md)
- Опциональное форматирование вывода через `prettierConfigPath` (явный путь к конфигу Prettier)
- Опциональный пакетный ESLint `--fix` после генерации при указании `tsconfigPath` и `eslintConfigPath`
- Поддерживает унифицированный отчёт `analyze-diff` (`schemaVersion: 2.0.0`) с отдельными секциями `semantic` (CI/governance) и `structural` (генерация)
- Восстанавливает совместимость `generate --useHistory` с semantic diff-отчётами (ghost operations/properties, coercion, rename miracles)
- Использует селективное раскрытие OpenAPI `$ref` в analyze-diff для более быстрого и безопасного сравнения
- Автоматическое обнаружение RENAME / TYPE_COERCION miracles из semantic-изменений свойств

## Выберите свой путь

| Задача | Документ |
|--------|----------|
| Сгенерировать первый клиент | [Быстрый старт](docs/ru/getting-started.md) |
| Апгрейд с 1.x / custom HTTP / warnings `check-config` | **[RequestExecutor hub](docs/ru/request-executor.md)** |
| Миграция конфига и diff reports | [Миграция](docs/ru/migration.md) |

## Установка

```bash
npm install ts-openapi-codegen --save-dev
```

## Agent Skills

Для AI-агентов в пакете есть [Agent Skills](https://agentskills.io) по RequestExecutor и Marauder. После установки:

```bash
cp -r node_modules/ts-openapi-codegen/skills ./openapi-codegen-skills
```

Подробнее: [skills/README.md](skills/README.md).

- **Документация для людей:** [RequestExecutor hub](docs/ru/request-executor.md)
- **Cheatsheet для агентов:** [skills/request-executor-openapi-codegen/SKILL.md](skills/request-executor-openapi-codegen/SKILL.md)

## Документация

Полный индекс: [docs/ru/README.md](docs/ru/README.md).

| Документ | Описание |
|----------|----------|
| [Быстрый старт](docs/ru/getting-started.md) | Generate → `createClient` → вызов API |
| **[RequestExecutor hub](docs/ru/request-executor.md)** | Custom HTTP, миграция |
| [Миграция](docs/ru/migration.md) | Пути A/B/C |
| [Рецепты конфигов](docs/ru/config-recipes.md) | Паттерны конфига |
| [Справочник конфигурации](docs/ru/configuration-reference.md) | Все ключи |
| [Справочник CLI](docs/ru/cli-reference.md) | Команды и флаги |
| [Возможности](docs/ru/features.md) | Опции генерации |
| [Примеры](docs/ru/examples.md) | Примеры |
| [MIGRATION.RU.md](MIGRATION.RU.md) | Breaking changes |
| [Плагины](docs/ru/plugins.md) | Plugins |
| [English README](README.md) | English landing |
| [English docs](docs/en/request-executor.md) | RequestExecutor (EN) |

[npm-url]: https://www.npmjs.com/package/ts-openapi-codegen
[npm-image]: https://img.shields.io/npm/v/ts-openapi-codegen.svg
[license-url]: LICENSE
[license-image]: http://img.shields.io/npm/l/ts-openapi-codegen.svg
[downloads-url]: http://npm-stat.com/charts.html?package=ts-openapi-codegen
[downloads-image]: http://img.shields.io/npm/dm/ts-openapi-codegen.svg
[travis-url]: https://app.travis-ci.com/github/ozonophore/openapi-codegen
[travis-image]: https://app.travis-ci.com/github/ozonophore/openapi-codegen.svg?branch=master
[coverage-url]: https://codecov.io/gh/ozonophore/openapi-codegen
[coverage-image]: https://codecov.io/gh/ozonophore/openapi-codegen/branch/master/graph/badge.svg?token=RBPZ01BW0Y
[typescript-url]: https://www.typescriptlang.org
[typescript-image]: https://badgen.net/badge/icon/typescript?icon=typescript&label
[CI-url]: https://github.com/ozonophore/openapi-codegen/actions/workflows/CI.yml
[CI-image]: https://github.com/ozonophore/openapi-codegen/actions/workflows/CI.yml/badge.svg?branch=master
[issues-url]: https://github.com/ozonophore/openapi-codegen/issues
[issues-image]: https://img.shields.io/github/issues/ozonophore/openapi-codegen.svg
[issues-pr-url]: https://github.com/ozonophore/openapi-codegen/pulls
[issues-pr-image]: https://img.shields.io/github/issues-pr/ozonophore/openapi-codegen.svg
[issues-pr-closed-url]: https://github.com/ozonophore/openapi-codegen/pulls?q=is%3Apr+is%3Aclosed
[issues-pr-closed-image]: https://img.shields.io/github/issues-pr-closed/ozonophore/openapi-codegen.svg
[stars-url]: https://github.com/ozonophore/openapi-codegen/stargazers
[stars-image]: https://img.shields.io/github/stars/ozonophore/openapi-codegen.svg
[librariesio-image]: https://img.shields.io/librariesio/github/ozonophore/openapi-codegen
[lines-image]: https://img.shields.io/tokei/lines/github/ozonophore/openapi-codegen
