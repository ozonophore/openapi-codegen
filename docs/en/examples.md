## Examples

---

### First time — new project (5 minutes)

Get from zero to a working TypeScript client in one sitting.

**Step 1: Initialize your project**
```bash
npm install ts-openapi-codegen --save-dev
openapi-codegen-cli init
```

This generates `openapi.config.json`:
```json
{
  "input": "https://petstore.swagger.io/v2/swagger.json",
  "output": "./generated",
  "httpClient": "fetch",
  "useOptions": true
}
```

**Step 2: Generate the TypeScript client**
```bash
openapi-codegen-cli generate
```

This creates a `./generated` folder with your API client.

**Step 3: Use the generated client in your application**

```typescript
import { createClient } from './generated';

// Create a client instance
const client = createClient();

// Fully typed — no manual interface required
const users = await client.UsersService.getUsers();
const user = await client.UsersService.getUserById({ id: 1 });
```

**Expected output structure:**
```
./generated/
├── index.ts                 (exports createClient)
├── models/
│   ├── User.ts
│   ├── Order.ts
│   └── ...
├── services/
│   ├── UsersService.ts
│   ├── OrdersService.ts
│   └── ...
└── core/
    ├── request.ts
    └── ApiError.ts
```

---

### Multi-spec configuration — separate per-service clients

Use a shared `openapi.config.json` with multiple `items` to generate independent clients for each microservice, API version, or domain. Each spec generates into its own folder with its own `createClient()` function.

**When to use multi-spec:**
- **Microservices**: Each service has its own OpenAPI spec (Users API, Payments API, Orders API, etc.), each with independent base URLs
- **API versioning**: Maintain v1, v2 specs in parallel, each importable and configurable separately
- **Domain separation**: Different teams own different API specs; each client is independently maintained
- **External APIs**: Combine internal and third-party API specs, each with separate configuration

**Configuration with multiple specs:**

```json
{
  "httpClient": "fetch",
  "useOptions": true,
  "useUnionTypes": true,
  "items": [
    {
      "input": "./openapi/users.yaml",
      "output": "./src/generated/users"
    },
    {
      "input": "./openapi/payments.yaml",
      "output": "./src/generated/payments"
    },
    {
      "input": "./openapi/orders.yaml",
      "output": "./src/generated/orders"
    }
  ]
}
```

**Note:** Each item has its own `output` path. Each generated folder contains a separate `index.ts` with an independent `createClient()` function, allowing per-service configuration and base URLs.

**Generate all specs:**
```bash
openapi-codegen-cli generate
```

**Use separate per-service clients:**

```typescript
import { createClient as createUsersClient } from './generated/users';
import { createClient as createPaymentsClient } from './generated/payments';
import { createClient as createOrdersClient } from './generated/orders';

// Create independent client for each microservice
const usersApi = createUsersClient({
  openApi: { BASE: 'https://users-api.example.com' }
});
const paymentsApi = createPaymentsClient({
  openApi: { BASE: 'https://payments-api.example.com' }
});
const ordersApi = createOrdersClient({
  openApi: { BASE: 'https://orders-api.example.com' }
});

// Access services with full typing, independently configured
const users = await usersApi.UsersService.getUsers();
const balance = await paymentsApi.PaymentsService.getBalance({ userId: 123 });
const orders = await ordersApi.OrdersService.getOrders({ status: 'PENDING' });

// Create payment with full type safety
const payment = await paymentsApi.PaymentsService.createPayment({
  orderId: orders[0].id,
  amount: 99.99
});
```

**Generated structure for multi-spec:**
```
./src/generated/
├── users/
│   ├── index.ts                 (exports createClient)
│   ├── services/UsersService.ts
│   ├── models/User.ts
│   └── core/
├── payments/
│   ├── index.ts                 (exports createClient)
│   ├── services/PaymentsService.ts
│   ├── models/Payment.ts
│   └── core/
├── orders/
│   ├── index.ts                 (exports createClient)
│   ├── services/OrdersService.ts
│   ├── models/Order.ts
│   └── core/
```

---

### CI/CD pipeline — automating code generation

Full quality gate: detect breaking changes, generate, verify consumer, typecheck.

**Recommended command chain:**

```bash
# 1. Check for breaking changes and governance violations
openapi-codegen-cli analyze-diff \
  --input ./openapi/spec.yaml \
  --compare-with ./openapi/spec.base.yaml \
  --governance-config ./governance.json \
  --check

# 2. Generate with strict diagnostics
openapi-codegen-cli generate \
  --strict-openapi \
  --fail-on-governance-errors

# 3. Verify consumer imports (fails CI on ERROR-level mismatches)
openapi-codegen-cli analyze-usage \
  --sourcePath ./src/generated/index.ts \
  --projectPath . \
  --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json

# 4. TypeScript type check
tsc --noEmit
```

**What each step does:**

| Step | Command | Purpose | Fails If |
|------|---------|---------|----------|
| 1 | `analyze-diff` | Detect breaking API changes vs. baseline | Breaking changes detected or governance violations |
| 2 | `generate` | Generate client with strict validation | OpenAPI spec invalid or governance errors |
| 3 | `analyze-usage` | Verify generated code is consumed correctly | Usage mismatches or type errors in consumer code |
| 4 | `tsc --noEmit` | TypeScript compilation check | Type errors in generated or consumer code |

**CI-ready configuration:**

```json
{
  "input": "https://api.example.com/openapi/spec.yaml",
  "output": "./src/generated",
  "httpClient": "fetch",
  "strictOpenapi": true,
  "failOnGovernanceErrors": true,
  "useOptions": true,
  "useUnionTypes": true
}
```

**Example GitHub Actions workflow:**

```yaml
name: API Code Generation CI

on:
  pull_request:
    paths:
      - 'openapi/**'
      - 'src/**'
      - '.github/workflows/**'

jobs:
  validate-and-generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - name: Check for breaking changes
        run: |
          openapi-codegen-cli analyze-diff \
            --input ./openapi/spec.yaml \
            --compare-with ./openapi/spec.base.yaml \
            --check
      
      - name: Generate client
        run: openapi-codegen-cli generate --strict-openapi
      
      - name: Verify consumer usage
        run: |
          openapi-codegen-cli analyze-usage \
            --sourcePath ./src/generated/index.ts \
            --projectPath . \
            --check
      
      - name: Type check
        run: npx tsc --noEmit
```

---

### Using CLI commands

**Basic generation:**
```bash
openapi-codegen-cli generate --input ./spec.json --output ./dist
```

**With configuration file:**
```bash
# First, create config file
openapi-codegen-cli init

# Then generate
openapi-codegen-cli generate
```

**With DTO models (classes mode):**
```bash
openapi-codegen-cli generate --input ./spec.json --output ./dist --modelsMode classes
```

**Generate diff report:**
```bash
openapi-codegen-cli analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml
```

**Generation cache with reuse store (preview):**
```bash
openapi-codegen-cli generate --openapi-config ./openapi.config.json --cache --cacheStrategy reuse
```

**Marauder preview flags on generate:**
```bash
openapi-codegen-cli generate --openapi-config ./openapi.config.json --auto-select --spec-analysis
```

**Consumer usage check with diff cross-validation:**
```bash
openapi-codegen-cli analyze-usage \
  --sourcePath ./generated/index.ts \
  --projectPath . \
  --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json
```

**Check configuration:**
```bash
openapi-codegen-cli check-config
openapi-codegen-cli update-config
```

**Preview changes before applying:**
```bash
openapi-codegen-cli preview-changes
```

---

### Using NPX

```bash
npx openapi-codegen-cli generate --input ./spec.json --output ./dist
```

---

### Using package.json scripts

**package.json**
```json
{
    "scripts": {
        "generate": "openapi-codegen-cli generate --input ./spec.json --output ./dist",
        "generate:config": "openapi-codegen-cli generate",
        "check-config": "openapi-codegen-cli check-config",
        "update-config": "openapi-codegen-cli update-config",
        "init-config": "openapi-codegen-cli init",
        "preview-changes": "openapi-codegen-cli preview-changes"
    }
}
```

---

### Node.js API

```javascript
const OpenAPI = require('ts-openapi-codegen');

OpenAPI.generate({
    input: './spec.json',
    output: './dist'
});

// Or by providing the content of the spec directly
OpenAPI.generate({
    input: require('./spec.json'),
    output: './dist'
});
```
