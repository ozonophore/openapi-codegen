## Examples

### Using CLI commands

**Basic generation:**
```bash
openapi generate --input ./spec.json --output ./dist
```

**With configuration file:**
```bash
# First, create config file
openapi init

# Then generate
openapi generate
```

**With DTO models (classes mode):**
```bash
openapi generate --input ./spec.json --output ./dist --modelsMode classes
```

**Generate diff report:**
```bash
openapi analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml
```

**Generation cache with reuse store (preview):**
```bash
openapi generate --openapi-config ./openapi.config.json --cache --cacheStrategy reuse
```

**Marauder preview flags on generate:**
```bash
openapi generate --openapi-config ./openapi.config.json --auto-select --spec-analysis
```

**Consumer usage check with diff cross-validation:**
```bash
openapi analyze-usage \
  --sourcePath ./generated/index.ts \
  --projectPath . \
  --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json
```

**Check configuration:**
```bash
openapi check-config
openapi update-config
```

**Preview changes before applying:**
```bash
openapi preview-changes
```

### Using NPX

```bash
npx ts-openapi-codegen generate --input ./spec.json --output ./dist
```

### Using package.json scripts

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

// Or by providing the content of the spec directly 🚀
OpenAPI.generate({
    input: require('./spec.json'),
    output: './dist'
});
```
