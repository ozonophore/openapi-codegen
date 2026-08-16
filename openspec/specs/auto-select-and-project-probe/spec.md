## Purpose

Auto-select HTTP client и validation library по project probe.

## Requirements

### Requirement: Auto-select применяется до generate
Когда autoSelect enabled, probe target directory MUST выполняться до OpenAPI.generate; результаты MUST merge в options (per-item или global).

#### Scenario: Global auto-select
- **WHEN** autoSelect true на top-level flat config
- **THEN** validationLibrary и httpClient могут быть overwritten до generate

#### Scenario: Per-item auto-select in items[]
- **WHEN** autoSelect на root и items[] присутствует
- **THEN** auto-select results merge в каждый item через items array path

---

### Requirement: Custom rules highest priority
Custom detection rules MUST сортироваться по priority descending; первое matching rule MUST определять validator и httpClient если заданы в rule.

#### Scenario: Custom rule match
- **WHEN** custom rule condition true с validator ZOD
- **THEN** result validator=ZOD независимо от default selection logic

---

### Requirement: Strict mode existing deps
При autoSelect.strict=true и обнаруженных existing validators/clients MUST выбираться первый из списка existing, не default.

#### Scenario: Strict with axios installed
- **WHEN** strict true и package.json содержит axios dependency
- **THEN** httpClient=axios (first existing)

---

### Requirement: Validator preference when multiple installed
Без strict mode при нескольких validators MUST prefer ZOD > JOI > YUP.

#### Scenario: Zod and Yup present
- **WHEN** both zod and yup in dependencies
- **THEN** selected validator is zod

---

### Requirement: Deployment target drives default HTTP client
Browser/edge/react-native targets MUST default to fetch; nodejs MUST default to node client; unknown MUST default axios.

#### Scenario: Browser deployment detected
- **WHEN** project probe определяет deploymentTarget browser без existing clients
- **THEN** httpClient fetch

---

### Requirement: preferSmallBundles constraint
Когда preferSmallBundles true и requiresSmallBundle detected, validator MUST default to none unless existing validators force otherwise.

#### Scenario: Small bundle project
- **WHEN** preferSmallBundles true, requiresSmallBundle true, no validators installed
- **THEN** validationLibrary none

---

### Requirement: Recommendations non-blocking
Optimization recommendations (tree-shaking, batch endpoints) MUST возвращаться в result но MUST NOT блокировать generation.

#### Scenario: Tree-shaking recommendation
- **WHEN** project lacks sideEffects:false
- **THEN** recommendations содержит bundle-size entry, generate proceeds

---

### Requirement: ProjectProbe disk strings use slash
Сравниваемые и сохраняемые строки дисковых путей ProjectProbe MUST использовать `/` после `pathHelpers`. Проверки префикса (consumer-файлы под `src`) MUST NOT дописывать нативный `path.sep` к пути, нормализованному к слешу. Тесты MUST проверять через `joinHelper`, не через нативный `path.join`.

#### Scenario: Файлы consumer совпадают с корнем src на Windows
- **WHEN** ProjectProbe отфильтровывает исходники consumer под `src` на Windows
- **THEN** файл под этим каталогом MUST считаться consumer-файлом, даже если `getFilePath()` использует `/`

#### Scenario: Тесты ProjectProbe проверяют через joinHelper
- **WHEN** тест ProjectProbe проверяет строку дискового пути
- **THEN** ожидаемое значение MUST быть собрано через `joinHelper`, не через нативный `path.join`
