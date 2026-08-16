## MODIFIED Requirements

### Requirement: OutputGroupResolver находит LCA для output-путей
`resolveOutputGroups(absoluteOutputPaths: string[])` ДОЛЖЕН находить Longest Common Ancestor (LCA) для двух и более путей. Если LCA тривиален (корень ФС, `/`, или совпадает с одним из входных путей) — ДОЛЖЕН возвращать `null` как сигнал для fallback к copy-based reuse. Возвращаемый LCA MUST использовать `/` и MUST NOT конвертироваться обратно в `path.sep` (`\`).

#### Scenario: LCA найден для нескольких output-путей
- **WHEN** пути `["/project/out/api-a", "/project/out/api-b"]`
- **THEN** `resolveOutputGroups` возвращает LCA `/project/out`

#### Scenario: тривиальный LCA возвращает null
- **WHEN** пути `["/project/api-a", "/other/api-b"]` с LCA `/`
- **THEN** возвращается `null` (fallback к copy)

#### Scenario: один путь возвращает null
- **WHEN** передан массив с одним элементом
- **THEN** возвращается `null` (auto-group бессмысленен для одной спеки)

#### Scenario: LCA остаётся со слешем на Windows
- **WHEN** `resolveOutputGroups` возвращает не-`null` LCA на Windows
- **THEN** строка MUST использовать `/` и MUST NOT содержать `\`
