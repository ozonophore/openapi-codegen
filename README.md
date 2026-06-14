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

> Node.js library that generates Typescript clients based on the OpenAPI specification.

## Why?
- Frontend ❤️ OpenAPI, but we do not want to use JAVA codegen in our builds
- Quick, lightweight, robust and framework agnostic 🚀
- Supports generation of TypeScript clients
- Supports generations of fetch, XHR, Node.js and axios http clients
- Supports OpenAPI specification v2.0 and v3.0
- Supports JSON and YAML files for input
- Supports generation through CLI, Node.js and NPX
- Supports tsc and @babel/plugin-transform-typescript
- Supports customization names of models
- Supports external references using [`swagger-parser`](https://github.com/APIDevTools/swagger-parser/)
- Supports strict OpenAPI diagnostics with JSON reports (`--strict-openapi`, `--report-file`)
- Supports generator plugins (`plugins`) including built-in `x-typescript-type`
- Supports binary request/response generation (`format: binary` -> `Blob`)
- Supports opt-in generation cache and incremental writes (`--cache`, `--cachePath`, `--cacheStrategy`, `--cacheDebug`)
- Generated services accept a `RequestExecutor` in the constructor (`request` / `requestRaw`, interceptors, `customExecutorPath` / `createExecutorAdapter`, `createLegacyRequestAdapter`)
- CLI `init --requestFormat` scaffolds custom HTTP layers: legacy transport, `createExecutorAdapter`, or standalone `RequestExecutor`
- `check-config` validates `request` / `customExecutorPath` file presence and `createExecutorAdapter` export
- Optional output formatting via `prettierConfigPath` (explicit Prettier config file)
- Optional batch ESLint `--fix` after generation when both `tsconfigPath` and `eslintConfigPath` are set
- Supports unified `analyze-diff` report (`schemaVersion: 2.0.0`) with separate `semantic` (CI/governance) and `structural` (generation) sections
- Restores `generate --useHistory` compatibility with semantic diff reports (ghost operations/properties, coercion, rename miracles)
- Uses selective OpenAPI `$ref` expansion in analyze-diff for faster and safer comparison
- Automatic RENAME / TYPE_COERCION miracle detection from semantic property changes

## Install

```bash
npm install ts-openapi-codegen --save-dev
```

## Agent Skills

AI agents can use bundled [Agent Skills](https://agentskills.io) for RequestExecutor migration and Marauder features. After install:

```bash
cp -r node_modules/ts-openapi-codegen/skills ./openapi-codegen-skills
```

See [skills/README.md](skills/README.md) for agent paths (Cursor, Claude Code, Codex) and available skills.

## Documentation

- [Usage](docs/en/usage.md)
- [Configuration file](docs/en/configuration.md)
- [Examples](docs/en/examples.md)
- [Features](docs/en/features.md)
- [Migration guide](MIGRATION.md)
- [Plugins](docs/en/plugins.md)
- [Plugin API v2 (RFC)](docs/en/plugin-api-v2.md)
- [Русская версия README](README.rus.md)
- [Русская документация](docs/ru/usage.md)

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
