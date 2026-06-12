import type { ProjectContext } from '../../../core/projectProbe';
import type { Contract, Finding, Rule, Stats } from '../types';
import type { ApiImportScope } from '../utils/apiImportScope';

export class CoverageRule implements Rule {
    private readonly ignoredUnusedModels = new Set(['ApiError', 'RequestConfig', 'RequestExecutor', 'TOpenAPIConfig', 'OpenAPI', 'createExecutorAdapter', 'ClientOptions']);

    async check(context: ProjectContext, contract: Contract, stats: Stats, apiScope: ApiImportScope): Promise<Finding[]> {
        void context;
        void apiScope;
        const findings: Finding[] = [];

        // Проверка неиспользуемых схем
        contract.schemas.forEach(schema => {
            if (!stats.usedSchemas.has(schema)) {
                findings.push({
                    id: 'UNUSED_SCHEMA',
                    category: 'UNUSED',
                    severity: 'WARNING',
                    message: `Schema "${schema}" is exported by the API but not used in the project.`,
                    file: 'API Contract',
                    line: 0,
                });
            }
        });

        // Проверка неиспользуемых моделей
        contract.models.forEach(model => {
            if (this.ignoredUnusedModels.has(model)) return;
            if (!stats.usedModels.has(model)) {
                findings.push({
                    id: 'UNUSED_MODEL',
                    category: 'UNUSED',
                    severity: 'WARNING',
                    message: `Model "${model}" is exported by the API but not used in the project.`,
                    file: 'API Contract',
                    line: 0,
                });
            }
        });

        // Проверка неиспользуемых методов
        Object.entries(contract.services).forEach(([serviceName, methods]) => {
            methods.forEach(method => {
                const methodKey = `${serviceName}.${method.name}`;
                if (!stats.usedMethods.has(methodKey)) {
                    findings.push({
                        id: 'UNUSED_METHOD',
                        category: 'UNUSED',
                        severity: 'WARNING',
                        message: `Method "${methodKey}" is exported by the API but not used in the project.`,
                        file: 'API Contract',
                        line: 0,
                    });
                }
            });
        });

        return findings;
    }
}
