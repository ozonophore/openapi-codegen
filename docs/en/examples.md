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
openapi analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml --output-report ./openapi-diff-report.json
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


