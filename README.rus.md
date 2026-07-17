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

> Node.js библиотека, которая генерирует клиенты TypeScript на основе спецификации OpenAPI.

## Быстрый старт

```bash
npm install ts-openapi-codegen --save-dev

# Создать файл конфигурации
openapi-codegen-cli init

# Сгенерировать TypeScript клиент
openapi-codegen-cli generate
```

Импортируйте сгенерированный клиент в проект:

```typescript
import { createClient } from './generated';

const client = createClient({
  interceptors: {
    onRequest: (config) => config,
    onResponse: (response) => response,
    onError: (error) => error,
  },
});

const users = await client.UsersService.getUsers();
```

## Зачем этот инструмент?

Frontend-команды любят OpenAPI-контракты, но ненавидят вручную поддерживать HTTP-обёртки. Этот инструмент генерирует полностью типизированные TypeScript-клиенты напрямую из спеки — без Java, без тяжёлых рантаймов, без привязки к фреймворку. Вы сами контролируете HTTP-слой, директорию вывода и ритм обновлений.

## Что вы получаете

**Генерация**
- TypeScript клиенты для `fetch`, `xhr`, `node` (node-fetch) и `axios`
- Модели как интерфейсы или DTO-классы с геттерами и `toJSON()`
- Схемы валидации в рантайме для Zod, Joi, Yup и JSON Schema
- Плагины генератора, включая встроенный `x-typescript-type`

**Анализ и CI**
- Строгая диагностика OpenAPI с правилами governance и JSON-отчётами
- `analyze-diff` — обнаружение breaking changes между версиями спеки
- `analyze-usage` — проверка, что приложение вызывает все сгенерированные эндпоинты

**Продвинутое / Preview**
- `--auto-select` — рекомендация HTTP-клиента и библиотеки валидации на основе проекта *(preview)*
- `--spec-analysis` — per-spec и cross-spec детекторы качества спеки *(preview)*
- `cacheStrategy: "reuse"` — глобальный ReuseStore для переиспользования артефактов в monorepo *(preview)*

## CLI-команды

| Команда | Назначение | Когда использовать |
|---------|-----------|-------------------|
| `init` | Создать `openapi.config.json` | Первоначальная настройка |
| `generate` | Сгенерировать TypeScript-клиент | После каждого изменения спеки |
| `preview-changes` | Diff текущего и нового вывода | Перед перезаписью generated-файлов |
| `analyze-diff` | Обнаружить breaking changes | На каждом PR со спекой / в CI |
| `analyze-usage` | Проверить импорты consumer | После генерации в CI |
| `check-config` | Валидировать файл конфига | При ошибках конфигурации |
| `update-config` | Мигрировать конфиг на последнюю схему | После обновления пакета |

## Документация

- [Использование](docs/ru/usage.md)
- [Файл конфигурации](docs/ru/configuration.md)
- [Примеры](docs/ru/examples.md)
- [Возможности](docs/ru/features.md)
- [Руководство по миграции](MIGRATION.RU.md)
- [Плагины](docs/ru/features.md#plugin-system)
- [Plugin API v2 (RFC)](docs/ru/features.md#plugin-api-v2-rfc)
- [English README](README.md)
- [English docs](docs/en/usage.md)

## Участие в разработке

Pull request приветствуются. Пожалуйста, откройте issue для обсуждения изменений.

## Лицензия

MIT

[npm-url]: https://www.npmjs.com/package/ts-openapi-codegen
[npm-image]: https://img.shields.io/npm/v/ts-openapi-codegen.svg
[license-url]: LICENSE
[license-image]: http://img.shields.io/npm/l/ts-openapi-codegen.svg
[downloads-url]: http://npm-stat.com/charts.html?package=ts-openapi-codegen
[downloads-image]: http://img.shields.io/npm/dm/ts-openapi-codegen.svg
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
