## Примеры

---

### Первый раз — новый проект (5 минут)

От нуля до работающего TypeScript-клиента за один подход.

**Установка и инициализация:**

```bash
# 1. Установить пакет
npm install ts-openapi-codegen --save-dev

# 2. Создать файл конфигурации
npx openapi-codegen-cli init
```

При выполнении `init` будет создан файл `openapi.config.json`:

```json
{
    "input": "./openapi/spec.json",
    "output": "./src/generated",
    "httpClient": "fetch",
    "useOptions": true,
    "useUnionTypes": true
}
```

**Генерация клиента:**

```bash
# 3. Сгенерировать TypeScript-клиент
npx openapi-codegen-cli generate
```

**Структура генерируемых файлов:**

```
./src/generated/
├── index.ts                    # главный экспорт
├── services/
│   ├── UsersService.ts
│   ├── OrdersService.ts
│   └── ...
├── models/
│   ├── User.ts
│   ├── Order.ts
│   └── ...
├── schemas/
└── core/
    ├── request.ts
    └── ApiError.ts
```

**Использование в приложении с `createClient()`:**

```typescript
import { createClient } from './generated';

// Инициализировать клиент с RequestExecutor 2.0.0+ конфигом
const api = createClient({
    openApi: {
        BASE: 'https://api.example.com'
    }
});

// Полностью типизировано — без ручных интерфейсов
const users = await api.UsersService.getUsers();
const user = await api.UsersService.getUser({ id: '123' });

// Создание нового пользователя
const newUser = await api.UsersService.createUser({
    name: 'John Doe',
    email: 'john@example.com'
});
```

---

### Настройка команды — конфиг-файл с несколькими спеками

Используйте единый `openapi.config.json` для управления несколькими спеками API с общей структурой вывода. Полезно для микросервисной архитектуры, версионирования API или разделения доменов.

**Сценарии использования:**
- **Микросервисы**: отдельные спеки для Users, Orders, Payments, Notifications
- **Версионирование**: `users-v1.yaml`, `users-v2.yaml` в разных папках
- **Доменное разделение**: публичное API vs внутреннее API

**Конфигурация с несколькими спеками:**

```json
{
    "output": "./src/generated",
    "httpClient": "fetch",
    "useOptions": true,
    "useUnionTypes": true,
    "excludeCoreServiceFiles": false,
    "items": [
        {
            "input": "./openapi/users.yaml",
            "output": "./src/generated/users"
        },
        {
            "input": "./openapi/orders.yaml",
            "output": "./src/generated/orders"
        },
        {
            "input": "./openapi/payments.yaml",
            "output": "./src/generated/payments"
        }
    ]
}
```

**Генерация:**

```bash
# Сгенерировать все спеки из конфига
npx openapi-codegen-cli generate
```

**Структура генерируемых файлов для каждого сервиса:**

```
./src/generated/
├── users/
│   ├── index.ts
│   ├── services/UsersService.ts
│   ├── models/User.ts
│   └── core/
├── orders/
│   ├── index.ts
│   ├── services/OrdersService.ts
│   ├── models/Order.ts
│   └── core/
├── payments/
│   ├── index.ts
│   ├── services/PaymentsService.ts
│   ├── models/Payment.ts
│   └── core/
└── shared/  # общие типы (если есть)
```

**Использование в приложении:**

```typescript
import { createClient as createUsersClient } from './generated/users';
import { createClient as createOrdersClient } from './generated/orders';
import { createClient as createPaymentsClient } from './generated/payments';

// Инициализировать отдельные клиенты для каждого микросервиса
// Каждый createClient() возвращает объект с методами всех сервисов из этого spec
const usersApi = createUsersClient({ 
    openApi: { BASE: 'https://users-api.example.com' } 
});
const ordersApi = createOrdersClient({ 
    openApi: { BASE: 'https://orders-api.example.com' } 
});
const paymentsApi = createPaymentsClient({ 
    openApi: { BASE: 'https://payments-api.example.com' } 
});

// Типизированный доступ к методам каждого микросервиса
const users = await usersApi.UsersService.getUsers();
const orders = await ordersApi.OrdersService.getOrders({ userId: '123' });
const payment = await paymentsApi.PaymentsService.createPayment({
    orderId: 'order-456',
    amount: 99.99
});
```

---

### CI/CD pipeline

Полный quality gate: обнаружение breaking changes → генерация → проверка consumer → typecheck.

**Назначение каждого шага:**

1. **Анализ breaking changes** — проверяет совместимость спецификаций перед генерацией
2. **Strict генерация** — гарантирует качество сгенерированного кода
3. **Проверка consumer** — убеждается, что сгенерированный код использует правильно в проекте
4. **Type-check** — валидирует TypeScript типы

**Цепочка команд:**

```bash
# 1. Проверить breaking changes (CI упадёт при ошибках governance)
npx openapi-codegen-cli analyze-diff \
  --input ./openapi/spec.yaml \
  --compare-with ./openapi/spec.base.yaml \
  --governance-config ./governance.json \
  --ci

# 2. Генерация со strict-диагностикой
npx openapi-codegen-cli generate \
  --openapi-config ./openapi.config.json \
  --strict-openapi \
  --governance-config ./governance.json \
  --fail-on-governance-errors

# 3. Проверить импорты consumer (CI упадёт при несоответствиях уровня ERROR)
npx openapi-codegen-cli analyze-usage \
  --sourcePath ./src/generated/index.ts \
  --projectPath . \
  --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json

# 4. Проверка TypeScript типов
npx tsc --noEmit
```

**Конфигурация качества (governance.json):**

```json
{
    "rules": [
        {
            "name": "no-breaking-changes",
            "severity": "error"
        },
        {
            "name": "required-description",
            "severity": "warn"
        },
        {
            "name": "schema-validation",
            "severity": "error"
        }
    ],
    "failOnErrors": true
}
```

**Пример CI конфига (.github/workflows/api-quality-gate.yml):**

```yaml
name: API Quality Gate

on: [push, pull_request]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - name: "Step 1: Check breaking changes"
        run: npx openapi-codegen-cli analyze-diff \
          --input ./openapi/spec.yaml \
          --compare-with ./openapi/spec.base.yaml \
          --governance-config ./governance.json \
          --ci
      
      - name: "Step 2: Generate with strict rules"
        run: npx openapi-codegen-cli generate \
          --openapi-config ./openapi.config.json \
          --strict-openapi \
          --governance-config ./governance.json \
          --fail-on-governance-errors
      
      - name: "Step 3: Verify consumer usage"
        run: npx openapi-codegen-cli analyze-usage \
          --sourcePath ./src/generated/index.ts \
          --projectPath . \
          --check \
          --diff-report ./.openapi-codegen-reports/openapi-diff-report.json
      
      - name: "Step 4: TypeScript type check"
        run: npx tsc --noEmit
      
      - name: "Generate reports"
        if: always()
        run: npm run build:reports
```

---

### Использование CLI команд

**Базовая генерация:**
```bash
openapi-codegen-cli generate --input ./spec.json --output ./dist
```

**С файлом конфигурации:**
```bash
# Сначала создайте файл конфигурации
openapi-codegen-cli init

# Затем выполните генерацию
openapi-codegen-cli generate
```

**С DTO моделями (режим classes):**
```bash
openapi-codegen-cli generate --input ./spec.json --output ./dist --modelsMode classes
```

**Сгенерировать diff-отчёт:**
```bash
openapi-codegen-cli analyze-diff --input ./openapi/current.yaml --compare-with ./openapi/previous.yaml
```

**Кэш генерации с reuse store (preview):**
```bash
openapi-codegen-cli generate --openapi-config ./openapi.config.json --cache --cacheStrategy reuse
```

**Marauder preview flags при generate:**
```bash
openapi-codegen-cli generate --openapi-config ./openapi.config.json \
  --auto-select --spec-analysis \
  --workspace-report --pre-analyze \
  --traffic-splitter --swarm \
  --reuse-mode auto-group

# Полный пример Phase 2:
openapi-codegen-cli generate -ocn example/openapi.marauder.config.json
```

**Проверка consumer usage с cross-validation diff:**
```bash
openapi-codegen-cli analyze-usage \
  --sourcePath ./generated/index.ts \
  --projectPath . \
  --check \
  --diff-report ./.openapi-codegen-reports/openapi-diff-report.json
```

**Проверка конфигурации:**
```bash
openapi-codegen-cli check-config
openapi-codegen-cli update-config
```

**Предпросмотр изменений перед применением:**
```bash
openapi-codegen-cli preview-changes
```

---

### Использование NPX

```bash
npx openapi-codegen-cli generate --input ./spec.json --output ./dist
```

---

### Использование скриптов в package.json

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

// Или передав содержимое спецификации напрямую
OpenAPI.generate({
    input: require('./spec.json'),
    output: './dist'
});
```
