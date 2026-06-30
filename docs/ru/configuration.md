### Файл конфигурации

> **Полный справочник:** [configuration-reference.md](configuration-reference.md)
> **Готовые рецепты:** [config-recipes.md](config-recipes.md)
> **HTTP-ключи (`request`, `customExecutorPath`):** [request-executor.md](request-executor.md)

Вместо передачи всех опций через CLI можно использовать файл конфигурации. Создайте `openapi.config.json` в корне проекта:

**Формат single options:**
```json
{
    "input": "./spec.json",
    "output": "./dist",
    "httpClient": "fetch",
    "useOptions": false,
    "useUnionTypes": false,
    "request": "./custom-request.ts",
    "customExecutorPath": "./custom/createExecutorAdapter.ts",
    "validationLibrary": "none",
    "emptySchemaStrategy": "keep",
    "plugins": ["./plugins/custom-type.plugin.cjs"]
}
```

**Формат multi options:**
```json
{
    "output": "./dist",
    "httpClient": "fetch",
    "items": [
        { "input": "./first.yml" },
        { "input": "./second.yml", "output": "./dist-v2" }
    ]
}
```

Полная таблица ключей: [configuration-reference.md](configuration-reference.md).

Scaffold: `openapi-codegen-cli init`.

### Plugins

- Ключ конфигурации: `plugins` (массив путей)
- [Плагины](plugins.md)
- [Plugin API v2](plugin-api-v2.md)

**English:** [configuration.md (EN)](../en/configuration.md)
