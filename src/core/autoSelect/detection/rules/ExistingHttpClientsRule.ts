import { HttpClient } from '../../../types/enums/HttpClient.enum';
import type { ProjectAnalysis } from '../../types';
import type { DetectionRule, PackageJsonContext } from '../types';

export class ExistingHttpClientsRule implements DetectionRule {
    readonly id = 'existing-http-clients';

    apply(ctx: PackageJsonContext, analysis: ProjectAnalysis): void {
        const clients = analysis.packageJson.existingHttpClients;

        if (ctx.allDeps.axios) clients.push(HttpClient.AXIOS);
        if (ctx.allDeps['node-fetch'] || ctx.allDeps['cross-fetch']) clients.push(HttpClient.FETCH);
    }
}
