import fs from 'fs';
import path from 'path';

import type { CoverageReport, Finding, Stats } from '../types';

export class Reporter {
    /**
     * Выводит сводную таблицу и результаты в консоль
     */
    static renderConsole(findings: Finding[], coverage: CoverageReport): void {
        console.log('\n📊 API Coverage:');
        console.log(`   Methods: ${coverage.methods.used}/${coverage.methods.total} (${coverage.methods.percent})`);
        console.log(`   Schemas: ${coverage.schemas.used}/${coverage.schemas.total} (${coverage.schemas.percent})`);
        console.log(`   Models:  ${coverage.models.used}/${coverage.models.total} (${coverage.models.percent})`);

        if (findings.length === 0) {
            console.log('\n✅ No mismatches found. Project is in sync.');
            return;
        }

        console.log('\n⚠️  Findings:');

        // Форматируем данные для console.table
        const tableData = findings.map(f => ({
            Status: f.severity === 'ERROR' ? '🔴 ERROR' : '🟡 WARN',
            Category: f.category,
            Location: `${path.basename(f.file)}:${f.line}`,
            Message: f.message,
        }));

        console.table(tableData);
    }

    /**
     * Сохраняет отчет в формате JSON для CI/CD инструментов
     */
    static saveJsonReport(filePath: string, findings: Finding[], coverage: CoverageReport): void {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalIssues: findings.length,
                errors: findings.filter(f => f.severity === 'ERROR').length,
                warnings: findings.filter(f => f.severity === 'WARNING').length,
            },
            categories: findings.reduce<Record<string, number>>((acc, finding) => {
                acc[finding.category] = (acc[finding.category] || 0) + 1;
                return acc;
            }, {}),
            coverage,
            findings,
        };

        try {
            fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
            console.log(`\n💾 Report saved: ${path.resolve(filePath)}`);
        } catch (error: any) {
            console.error(`\n❌ Failed to save JSON report: ${error.message}`);
        }
    }

    /**
     * Вычисляет процент покрытия на основе статистики
     */
    static calculateCoverage(stats: Stats, contract: any): CoverageReport {
        const totalMethods = Object.values(contract.services).flat().length;
        const totalSchemas = contract.schemas.length;
        const totalModels = contract.models.length;

        const getPercent = (used: number, total: number) => (total > 0 ? ((used / total) * 100).toFixed(2) + '%' : '0%');

        return {
            methods: {
                total: totalMethods,
                used: stats.usedMethods.size,
                percent: getPercent(stats.usedMethods.size, totalMethods),
            },
            schemas: {
                total: totalSchemas,
                used: stats.usedSchemas.size,
                percent: getPercent(stats.usedSchemas.size, totalSchemas),
            },
            models: {
                total: totalModels,
                used: stats.usedModels.size,
                percent: getPercent(stats.usedModels.size, totalModels),
            },
        };
    }
}
