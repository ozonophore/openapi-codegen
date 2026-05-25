
### Использование CLI команд

**Базовая генерация:**
```bash
openapi generate --input ./spec.json --output ./dist
```

**С файлом конфигурации:**
```bash
# Сначала создайте файл конфигурации
openapi init

# Затем выполните генерацию
openapi generate
```

**С DTO моделями (режим classes):**
```bash
openapi generate --input ./spec.json --output ./dist --modelsMode classes
```

**Сгенерировать diff‑отчёт:**
```bash
openapi analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml --output-report ./openapi-diff-report.json
```

**Проверка конфигурации:**
```bash
openapi check-config
openapi update-config
```

**Предпросмотр изменений перед применением:**
```bash
openapi preview-changes
```

### Использование NPX

```bash
npx ts-openapi-codegen generate --input ./spec.json --output ./dist
```

### Использование скриптов в package.json

**package.json**
```json
{
    "scripts": {
        "generate": "openapi generate --input ./spec.json --output ./dist",
        "generate:config": "openapi generate",
        "check-config": "openapi check-config",
        "update-config": "openapi update-config",
        "init-config": "openapi init",
        "preview-changes": "openapi preview-changes"
    }
}
```

### Node.js API

```javascript
const OpenAPI = require('ts-openapi-codegen');

OpenAPI.generate({
    input: './spec.json',
    output: './dist'
});

// Или передав содержимое спецификации напрямую 🚀
OpenAPI.generate({
    input: require('./spec.json'),
    output: './dist'
});
```


## Возможности
