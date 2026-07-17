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

> Node.js library that generates TypeScript clients based on the OpenAPI specification.

## Quick Start

```bash
npm install ts-openapi-codegen --save-dev

# Create a configuration file
openapi-codegen-cli init

# Generate the TypeScript client
openapi-codegen-cli generate
```

Import the generated client in your project:

```typescript
import { createClient } from './generated';

const api = createClient({ interceptors: { onRequest: [...] } });
const users = await api.UserService.getUsers();
```

## Why this tool?

Frontend teams love OpenAPI contracts but hate maintaining hand-written HTTP wrappers. This tool generates fully-typed TypeScript clients directly from your spec — no Java, no heavy runtimes, no framework lock-in. You stay in control of the HTTP layer, the output directory, and the update cadence.

## What you get

**Generation**
- TypeScript clients for `fetch`, `xhr`, `node` (node-fetch), and `axios`
- Models as interfaces or DTO classes with getters and `toJSON()`
- Runtime validation schemas for Zod, Joi, Yup, and JSON Schema
- Generator plugins including built-in `x-typescript-type` support

**Analysis & CI**
- Strict OpenAPI diagnostics with governance rules and JSON reports
- `analyze-diff` — detect breaking changes between spec versions
- `analyze-usage` — verify your app still calls every generated endpoint

**Advanced / Preview**
- `--auto-select` — project-aware HTTP client and validation library recommendation *(preview)*
- `--spec-analysis` — per-spec and cross-spec quality detectors *(preview)*
- `cacheStrategy: "reuse"` — global ReuseStore for shared model artifacts in monorepos *(preview)*

## CLI Commands

| Command | Purpose | When to use |
|---------|---------|-------------|
| `init` | Create `openapi.config.json` | First time setup |
| `generate` | Generate TypeScript client | After every spec change |
| `preview-changes` | Diff current vs new output | Before overwriting generated files |
| `analyze-diff` | Detect breaking changes | On every spec PR / CI |
| `analyze-usage` | Verify consumer imports | After generation in CI |
| `check-config` | Validate config file | When config errors appear |
| `update-config` | Migrate config to latest schema | After upgrading the package |

## Documentation

- [Usage](docs/en/usage.md)
- [Configuration file](docs/en/configuration.md)
- [Examples](docs/en/examples.md)
- [Features](docs/en/features.md)
- [Migration guide](MIGRATION.md)
- [Plugins](docs/en/features.md#plugin-system)
- [Plugin API v2 (RFC)](docs/en/features.md#plugin-api-v2-rfc)
- [Русская версия README](README.rus.md)
- [Русская документация](docs/ru/usage.md)

## Contributing

Pull requests are welcome. Please open an issue first to discuss what you would like to change.

## License

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
