import type { ProjectContext } from '../../../core/projectProbe';
import { ClientRule } from '../rules/ClientRule';
import { CoverageRule } from '../rules/CoverageRule';
import { DiagnosticsRule } from '../rules/DiagnosticsRule';
import { ImportRule } from '../rules/ImportRule';
import { ModelRule } from '../rules/ModelRule';
import { SchemaRule } from '../rules/SchemaRule';
import { ServiceRule } from '../rules/ServiceRule';
import type { Contract, Finding, Stats } from '../types';
import type { ApiImportScope } from '../utils/apiImportScope';

export class Analyzer {
    private _context: ProjectContext;
    private _contract: Contract;
    private _apiScope: ApiImportScope;

    constructor(context: ProjectContext, contract: Contract, apiScope: ApiImportScope) {
        this._context = context;
        this._contract = contract;
        this._apiScope = apiScope;
    }

    async run(stats: Stats) {
        const findings: Finding[] = [];

        const rules = [new ImportRule(), new ClientRule(), new ServiceRule(), new SchemaRule(), new ModelRule(), new DiagnosticsRule(), new CoverageRule()];

        for (const rule of rules) {
            const results = await rule.check(this._context, this._contract, stats, this._apiScope);
            findings.push(...results);
        }

        return findings;
    }
}
