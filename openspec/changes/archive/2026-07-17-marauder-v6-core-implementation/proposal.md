## Почему

CLI-флаги и схема валидации для пяти Marauder V6-опций (`workspaceReport`, `trafficSplitter`, `swarm`, `preAnalyze`, `reuseMode`) уже добавлены, однако сами функции не реализованы: `OpenApiClient` их не читает, соответствующие модули в `src/core/` отсутствуют. Это изменение реализует всю core-логику, описанную в `openspec/research/PDD.md` (ветка `wip_marauder_next`, коммиты `9adadcd`, `7727a79`, `8071efe`, `efba83f`), чтобы флаги оказывали реальный эффект при генерации.

## Что меняется

- **workspaceReport** — новый модуль `src/core/workspaceReport/`: агрегация статистики генерации и cross-spec находок в сводный `workspace-report.json` / `workspace-report.md`; подключение к `OpenApiClient.generateCodeForItems` как постгенерационный шаг
- **trafficSplitter** — новый модуль `src/core/migration/`: класс `TrafficSplitter` с четырьмя стратегиями маршрутизации (weighted, round-robin, header-based, header-and-weighted), sticky sessions, статистикой сессий; генератор автономного `TrafficSplitter.ts` в output-папке
- **AvatarSwarm** — новый модуль `src/core/avatarSwarm/`: `AvatarSwarmGenerator` собирает `swarm-manifest.json` из items конфига и данных `ReuseStore`; подключение как постгенерационный шаг
- **preAnalyze** — новый предгенерационный шаг в `OpenApiClient`: парсит все спеки, строит транзиентный cross-spec манифест, запускает `CrossSpecAnalyzer`, выводит отчёт в stdout до записи первого файла
- **reuseMode: auto-group** — три новых файла в `src/core/reuseStore/`: `OutputGroupResolver` (LCA-алгоритм), `SharedFolderWriter` (canonical + stub-файлы в `__shared__/`), `computeStoreRelativeImport`; подключение в `WriteClient` при `reuseMode === 'auto-group'`

## Возможности

### Новые возможности

- `workspace-report-core`: генерация сводного workspace-отчёта (JSON + Markdown) из статистики specStats и данных CrossSpecAnalyzer
- `traffic-splitter-core`: класс TrafficSplitter с 4 стратегиями + генератор автономного модуля в output-папку
- `avatar-swarm-core`: генерация swarm-manifest.json — машиночитаемой карты multi-spec системы
- `pre-analyze-core`: предгенерационный кросс-спечный анализ с выводом в stdout
- `reuse-auto-group-core`: дедупликация shared-артефактов через shared-папку вместо физических копий

### Изменённые возможности

<!-- Требования к существующим capability не меняются, только аддитивные дополнения к OpenApiClient -->

## Влияние

- `src/core/OpenApiClient.ts` — подключение всех пяти шагов в `generate` и `generateCodeForItems`
- `src/core/WriteClient.ts` — поддержка `reuseMode: auto-group` в `writeClient`
- `src/common/TRawOptions.ts` / `TStrictFlatOptions` — новые поля для передачи опций вниз по пайплайну
- `src/common/Consts.ts` — defaults для новых полей
- `src/core/index.ts` — экспорт новых публичных API согласно PDD §7
- Нет breaking changes — все фичи opt-in, генерация без флагов работает как прежде
