import { DEFAULT_EXCLUDED_ANOMALY_CATEGORIES } from '../../common/VersionedSchema/anomalyDetectorCategories';
import { CommonOpenApi } from '../types/shared/CommonOpenApi.model';
import { Anomaly, AnomalyDetectionConfig, AnomalyReport, AnomalySummary, BatchEndpointPattern, OptimizationRecommendation } from './types';

export class AnomalyDetector {
    private readonly DEFAULT_CONFIG: AnomalyDetectionConfig = {
        enabled: true,
        severity: 'medium',
        reportFormat: 'json',
        excludeCategories: [...DEFAULT_EXCLUDED_ANOMALY_CATEGORIES],
    };

    /**
     * Detect anomalies in OpenAPI specification and generate report
     */
    public detectAndReport(spec: CommonOpenApi, config?: Partial<AnomalyDetectionConfig>): AnomalyReport {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };

        const anomalies: Anomaly[] = [];

        // Run all detection checks
        anomalies.push(...this.detectInconsistentResponses(spec));
        anomalies.push(...this.detectBatchEndpoints(spec));
        anomalies.push(...this.detectRedundantEndpoints(spec));
        anomalies.push(...this.detectMissingPagination(spec));
        anomalies.push(...this.detectMissingCachingHeaders(spec));
        anomalies.push(...this.detectCircularReferences(spec));
        anomalies.push(...this.detectDeeplyNestedObjects(spec, mergedConfig.maxNestingDepth));
        anomalies.push(...this.detectRateLimitPatterns(spec));
        anomalies.push(...this.detectDeprecatedEndpoints(spec));
        anomalies.push(...this.detectSchemaInconsistencies(spec));

        // Filter by severity
        const filteredAnomalies = this.filterBySeverity(anomalies, mergedConfig.severity || 'medium');

        // Filter by included/excluded categories
        const categorizedAnomalies = this.filterByCategories(filteredAnomalies, mergedConfig);

        // Calculate summary
        const summary = this.calculateSummary(categorizedAnomalies);

        // Generate recommendations
        const recommendations = this.generateRecommendations(categorizedAnomalies);

        return {
            timestamp: new Date().toISOString(),
            specVersion: this.getSpecVersion(spec),
            totalAnomalies: categorizedAnomalies.length,
            criticalAnomalies: categorizedAnomalies.filter(a => a.severity === 'high').length,
            anomalies: categorizedAnomalies,
            summary,
            recommendations,
        };
    }

    /**
     * Detect inconsistent response types across endpoints
     */
    private detectInconsistentResponses(spec: CommonOpenApi): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const paths = this.getPaths(spec);

        const resourceGroups = new Map<string, any[]>();

        for (const [path, pathItem] of Object.entries(paths)) {
            const resource = this.extractResourceName(path);
            if (!resourceGroups.has(resource)) {
                resourceGroups.set(resource, []);
            }

            const operations = this.getOperations(pathItem as any);
            for (const [method, operation] of Object.entries(operations)) {
                const responses = this.getResponses(operation as any);
                resourceGroups.get(resource)!.push({
                    path,
                    method,
                    responses,
                    operation,
                });
            }
        }

        for (const [resource, operations] of resourceGroups.entries()) {
            if (operations.length >= 2) {
                const inconsistencies = this.findResponseInconsistencies(operations);
                if (inconsistencies.length > 0) {
                    anomalies.push({
                        id: `inconsistent-${resource}`,
                        type: 'inconsistent-response-types',
                        severity: 'medium',
                        description: `Endpoints for "${resource}" resource return inconsistent response types`,
                        affectedPaths: inconsistencies.map(inc => inc.path),
                        benefitCategory: 'Standardization & Caching',
                        estimatedBenefit: 'Improved caching and type consistency',
                        suggestedAction: 'Normalize response types across related endpoints',
                    });
                }
            }
        }

        return anomalies;
    }

    /**
     * Detect batch endpoint patterns
     */
    private detectBatchEndpoints(spec: CommonOpenApi): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const paths = this.getPaths(spec);
        const pathArray = Object.keys(paths);

        const batchPatterns: BatchEndpointPattern[] = [];

        for (const path of pathArray) {
            if (path.includes('/batch') || path.includes('/bulk')) {
                const singlePath = path.replace(/\/batch|\/bulk/g, '');
                if (pathArray.some(p => p.includes(singlePath) && !p.includes('/batch'))) {
                    batchPatterns.push({
                        batchPath: path,
                        singlePath: singlePath || 'unknown',
                        estimatedThroughputGain: 10,
                    });
                }
            }
        }

        if (batchPatterns.length > 0) {
            anomalies.push({
                id: 'batch-endpoints-available',
                type: 'batch-endpoints-available',
                severity: 'high',
                description: `Found ${batchPatterns.length} batch endpoint pattern(s) that could improve throughput`,
                benefitCategory: 'Throughput & Performance',
                estimatedBenefit: 'Batch request throughput improvement',
                examples: batchPatterns.map(bp => `${bp.batchPath} (vs ${bp.singlePath})`),
                suggestedAction: 'Use batch endpoints for multiple requests when available',
            });
        }

        return anomalies;
    }

    /**
     * Detect redundant endpoints
     */
    private detectRedundantEndpoints(spec: CommonOpenApi): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const paths = this.getPaths(spec);

        const endpointSimilarity = new Map<string, string[]>();

        for (const path of Object.keys(paths)) {
            const normalized = this.normalizePathForComparison(path);
            if (!endpointSimilarity.has(normalized)) {
                endpointSimilarity.set(normalized, []);
            }
            endpointSimilarity.get(normalized)!.push(path);
        }

        for (const [normalized, paths] of endpointSimilarity.entries()) {
            if (paths.length > 2) {
                anomalies.push({
                    id: `redundant-${normalized}`,
                    type: 'redundant-endpoints',
                    severity: 'low',
                    description: `Found ${paths.length} endpoints for similar functionality: ${normalized}`,
                    affectedPaths: paths,
                    benefitCategory: 'Code Maintenance',
                    estimatedBenefit: 'Reduced maintenance burden',
                    suggestedAction: 'Consider consolidating similar endpoints',
                });
            }
        }

        return anomalies;
    }

    /**
     * Detect missing pagination patterns
     */
    private detectMissingPagination(spec: CommonOpenApi): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const paths = this.getPaths(spec);

        for (const [path, pathItem] of Object.entries(paths)) {
            if (path.includes('/') && !path.includes('{') && path.endsWith('s')) {
                const operations = this.getOperations(pathItem as any);
                const getOp = operations['get'] || operations['GET'];

                if (getOp) {
                    const parameters = this.getParameters(getOp as any) || [];
                    const hasPageParam = parameters.some(p => p.name?.includes('page') || p.name?.includes('offset'));
                    const hasLimitParam = parameters.some(p => p.name?.includes('limit') || p.name?.includes('size'));

                    if (!hasPageParam && !hasLimitParam) {
                        anomalies.push({
                            id: `missing-pagination-${path}`,
                            type: 'missing-pagination',
                            severity: 'medium',
                            description: `Endpoint "${path}" likely returns collection but lacks pagination parameters`,
                            affectedPaths: [path],
                            benefitCategory: 'Performance & Memory',
                            estimatedBenefit: 'Reduced memory usage and faster responses',
                            suggestedAction: 'Add pagination parameters (limit, offset/page)',
                        });
                    }
                }
            }
        }

        return anomalies;
    }

    /**
     * Detect missing caching headers
     */
    private detectMissingCachingHeaders(spec: CommonOpenApi): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const paths = this.getPaths(spec);

        for (const [path, pathItem] of Object.entries(paths)) {
            const operations = this.getOperations(pathItem as any);
            const getOp = operations['get'] || operations['GET'];

            if (getOp) {
                const responses = this.getResponses(getOp as any) || {};
                const hasHeaders = Object.values(responses).some(r => {
                    const headers = (r as any)?.headers;
                    return headers && (headers['cache-control'] || headers['Cache-Control']);
                });

                if (!hasHeaders) {
                    anomalies.push({
                        id: `missing-cache-${path}`,
                        type: 'missing-caching-headers',
                        severity: 'low',
                        description: `GET endpoint "${path}" lacks cache-control headers`,
                        affectedPaths: [path],
                        benefitCategory: 'Performance',
                        estimatedBenefit: 'Improved client-side caching efficiency',
                        suggestedAction: 'Add Cache-Control headers to responses',
                    });
                }
            }
        }

        return anomalies;
    }

    /**
     * Detect circular references in schemas
     */
    private detectCircularReferences(spec: CommonOpenApi): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const components = this.getComponents(spec);

        if (!components) return anomalies;

        const circularRefs = this.findCircularReferences(spec);

        if (circularRefs.length > 0) {
            anomalies.push({
                id: 'circular-references',
                type: 'circular-references',
                severity: 'medium',
                description: `Found ${circularRefs.length} circular reference(s) in schemas`,
                affectedPaths: circularRefs,
                benefitCategory: 'Code Generation',
                estimatedBenefit: 'Simplified type definitions',
                suggestedAction: 'Use discriminators or refactor circular references',
            });
        }

        return anomalies;
    }

    /**
     * Detect deeply nested objects
     */
    private detectDeeplyNestedObjects(spec: CommonOpenApi, maxNestingDepth = 5): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const components = this.getComponents(spec);

        if (!components) return anomalies;

        const deepSchemas = this.findDeeplyNestedSchemas(spec, maxNestingDepth);

        if (deepSchemas.length > 0) {
            anomalies.push({
                id: 'deeply-nested-objects',
                type: 'deeply-nested-objects',
                severity: 'low',
                description: `Found ${deepSchemas.length} deeply nested object(s) (depth > ${maxNestingDepth} levels)`,
                affectedPaths: deepSchemas,
                benefitCategory: 'Developer Experience',
                estimatedBenefit: 'Easier to work with flattened structures',
                suggestedAction: 'Consider flattening deeply nested object hierarchies',
            });
        }

        return anomalies;
    }

    /**
     * Detect rate limit patterns
     */
    private detectRateLimitPatterns(spec: CommonOpenApi): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const paths = this.getPaths(spec);

        let foundRateLimitHeaders = false;

        for (const pathItem of Object.values(paths)) {
            const operations = this.getOperations(pathItem as any);
            for (const operation of Object.values(operations)) {
                const responses = this.getResponses(operation as any) || {};

                for (const [status, response] of Object.entries(responses)) {
                    const headers = (response as any)?.headers;
                    if (headers && (headers['x-rate-limit'] || headers['ratelimit-limit'] || headers['x-ratelimit-limit'] || status === '429')) {
                        foundRateLimitHeaders = true;
                    }
                }
            }
        }

        if (foundRateLimitHeaders) {
            anomalies.push({
                id: 'rate-limit-patterns',
                type: 'rate-limit-patterns',
                severity: 'medium',
                description: 'API implements rate limiting that clients should handle',
                benefitCategory: 'Reliability',
                estimatedBenefit: 'Automatic rate limit handling and backoff',
                suggestedAction: 'Use --exploit-anomalies flag to generate circuit breaker',
            });
        }

        return anomalies;
    }

    /**
     * Detect deprecated endpoints
     */
    private detectDeprecatedEndpoints(spec: CommonOpenApi): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const paths = this.getPaths(spec);

        const deprecatedPaths: string[] = [];

        for (const [path, pathItem] of Object.entries(paths)) {
            const operations = this.getOperations(pathItem as any);
            for (const [method, operation] of Object.entries(operations)) {
                if ((operation as any)?.deprecated) {
                    deprecatedPaths.push(`${method.toUpperCase()} ${path}`);
                }
            }
        }

        if (deprecatedPaths.length > 0) {
            anomalies.push({
                id: 'deprecated-endpoints',
                type: 'deprecated-endpoints',
                severity: 'medium',
                description: `Found ${deprecatedPaths.length} deprecated endpoint(s)`,
                affectedPaths: deprecatedPaths,
                benefitCategory: 'Maintenance',
                estimatedBenefit: 'Cleaner codebase, encourages migration',
                examples: deprecatedPaths.slice(0, 3),
            });
        }

        return anomalies;
    }

    /**
     * Detect schema inconsistencies
     */
    private detectSchemaInconsistencies(spec: CommonOpenApi): Anomaly[] {
        const anomalies: Anomaly[] = [];
        const components = this.getComponents(spec);

        if (!components) return anomalies;

        const inconsistencies = this.findSchemaInconsistencies(spec);

        if (inconsistencies.length > 0) {
            anomalies.push({
                id: 'schema-inconsistencies',
                type: 'schema-inconsistencies',
                severity: 'low',
                description: `Found ${inconsistencies.length} schema inconsistencies`,
                affectedPaths: inconsistencies,
                benefitCategory: 'Type Safety',
                estimatedBenefit: 'More consistent and predictable API contracts',
            });
        }

        return anomalies;
    }

    // ===== Helper methods =====

    private getPaths(spec: CommonOpenApi): Record<string, any> {
        return (spec as any).paths || {};
    }

    private getComponents(spec: CommonOpenApi): any {
        return (spec as any).components || (spec as any).definitions;
    }

    private getOperations(pathItem: any): Record<string, any> {
        const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
        const ops: Record<string, any> = {};
        for (const method of methods) {
            if (pathItem[method]) {
                ops[method] = pathItem[method];
            }
        }
        return ops;
    }

    private getResponses(operation: any): Record<string, any> {
        return operation?.responses || {};
    }

    private getParameters(operation: any): any[] {
        return operation?.parameters || [];
    }

    private getSpecVersion(spec: any): string {
        return spec.openapi || spec.swagger || 'unknown';
    }

    private extractResourceName(path: string): string {
        return path.split('/').filter(p => p && !p.startsWith('{'))[0] || 'unknown';
    }

    private normalizePathForComparison(path: string): string {
        return path.replace(/{[^}]+}/g, '{id}').toLowerCase();
    }

    private findResponseInconsistencies(operations: Array<{ path: string; method: string; responses: Record<string, any> }>): Array<{ path: string }> {
        const signatures = new Map<string, string>();

        for (const operation of operations) {
            const signature = this.getSuccessResponseSignature(operation.responses);
            if (!signature) {
                continue;
            }
            signatures.set(`${operation.method.toUpperCase()} ${operation.path}`, signature);
        }

        const uniqueSignatures = new Set(signatures.values());
        if (uniqueSignatures.size <= 1) {
            return [];
        }

        return Array.from(signatures.keys()).map(pathKey => ({ path: pathKey }));
    }

    private getSuccessResponseSignature(responses: Record<string, any>): string | null {
        for (const [status, response] of Object.entries(responses)) {
            if (!/^2/.test(status)) {
                continue;
            }

            const content = (response as any)?.content;
            if (content) {
                const mediaTypes = Object.keys(content).sort();
                const schemaSignatures = mediaTypes.map(mediaType => {
                    const schema = content[mediaType]?.schema;
                    return `${mediaType}:${this.getSchemaTypeSignature(schema)}`;
                });
                return schemaSignatures.join('|');
            }

            const schema = (response as any)?.schema;
            if (schema) {
                return `legacy:${this.getSchemaTypeSignature(schema)}`;
            }
        }

        return null;
    }

    private findCircularReferences(spec: CommonOpenApi): string[] {
        const schemas = this.getSchemaDefinitions(spec);
        if (!schemas) {
            return [];
        }

        const cycles: string[] = [];
        const visiting = new Set<string>();
        const visited = new Set<string>();

        const traverse = (schemaName: string, pathStack: string[]): void => {
            if (visiting.has(schemaName)) {
                cycles.push([...pathStack, schemaName].join(' -> '));
                return;
            }
            if (visited.has(schemaName)) {
                return;
            }

            const schema = schemas[schemaName];
            if (!schema) {
                return;
            }

            visiting.add(schemaName);
            const refs = new Set<string>();
            this.collectSchemaRefs(schema, refs);

            for (const ref of refs) {
                const refName = this.resolveRefName(ref);
                if (refName && schemas[refName]) {
                    traverse(refName, [...pathStack, schemaName]);
                }
            }

            visiting.delete(schemaName);
            visited.add(schemaName);
        };

        for (const schemaName of Object.keys(schemas)) {
            if (!visited.has(schemaName)) {
                traverse(schemaName, []);
            }
        }

        return cycles;
    }

    private findDeeplyNestedSchemas(spec: CommonOpenApi, maxDepth: number): string[] {
        const schemas = this.getSchemaDefinitions(spec);
        if (!schemas) {
            return [];
        }

        const deepSchemas: string[] = [];
        for (const [schemaName, schema] of Object.entries(schemas)) {
            const depth = this.getSchemaNestingDepth(schema, schemas, new Set());
            if (depth > maxDepth) {
                deepSchemas.push(schemaName);
            }
        }

        return deepSchemas;
    }

    private findSchemaInconsistencies(spec: CommonOpenApi): string[] {
        const schemas = this.getSchemaDefinitions(spec);
        if (!schemas) {
            return [];
        }

        const propertyTypes = new Map<string, Map<string, string>>();

        for (const [schemaName, schema] of Object.entries(schemas)) {
            const properties = (schema as any)?.properties;
            if (!properties) {
                continue;
            }

            for (const [propertyName, propertySchema] of Object.entries(properties)) {
                const signature = this.getSchemaTypeSignature(propertySchema);
                if (!propertyTypes.has(propertyName)) {
                    propertyTypes.set(propertyName, new Map());
                }
                propertyTypes.get(propertyName)!.set(schemaName, signature);
            }
        }

        const inconsistencies: string[] = [];
        for (const [propertyName, typeBySchema] of propertyTypes.entries()) {
            const signatures = new Set(typeBySchema.values());
            if (signatures.size > 1) {
                const details = Array.from(typeBySchema.entries())
                    .map(([schemaName, signature]) => `${schemaName}(${signature})`)
                    .join(', ');
                inconsistencies.push(`property "${propertyName}" in schemas: ${details}`);
            }
        }

        return inconsistencies;
    }

    private getSchemaDefinitions(spec: CommonOpenApi): Record<string, any> | null {
        const components = this.getComponents(spec);
        if (!components) {
            return null;
        }

        return components.schemas || components;
    }

    private collectSchemaRefs(obj: unknown, refs: Set<string>): void {
        if (!obj || typeof obj !== 'object') {
            return;
        }

        if (Array.isArray(obj)) {
            for (const item of obj) {
                this.collectSchemaRefs(item, refs);
            }
            return;
        }

        const record = obj as Record<string, unknown>;
        if (typeof record.$ref === 'string' && record.$ref.startsWith('#/')) {
            refs.add(record.$ref);
        }

        for (const value of Object.values(record)) {
            this.collectSchemaRefs(value, refs);
        }
    }

    private resolveRefName(ref: string): string | null {
        const match = ref.match(/^#\/components\/schemas\/(.+)$/) || ref.match(/^#\/definitions\/(.+)$/);
        return match ? match[1] : null;
    }

    private getSchemaNestingDepth(schema: any, schemas: Record<string, any>, visited: Set<string>): number {
        if (!schema || typeof schema !== 'object') {
            return 0;
        }

        if (schema.$ref) {
            const refName = this.resolveRefName(schema.$ref);
            if (!refName || visited.has(refName)) {
                return 0;
            }

            visited.add(refName);
            const resolved = schemas[refName];
            const depth = this.getSchemaNestingDepth(resolved, schemas, visited);
            visited.delete(refName);
            return depth;
        }

        if (schema.properties) {
            let maxChildDepth = 0;
            for (const propertySchema of Object.values(schema.properties)) {
                maxChildDepth = Math.max(maxChildDepth, this.getSchemaNestingDepth(propertySchema, schemas, visited));
            }
            return 1 + maxChildDepth;
        }

        if (schema.items) {
            return 1 + this.getSchemaNestingDepth(schema.items, schemas, visited);
        }

        if (schema.allOf || schema.oneOf || schema.anyOf) {
            const composed = [...(schema.allOf || []), ...(schema.oneOf || []), ...(schema.anyOf || [])];
            let maxChildDepth = 0;
            for (const childSchema of composed) {
                maxChildDepth = Math.max(maxChildDepth, this.getSchemaNestingDepth(childSchema, schemas, visited));
            }
            return maxChildDepth;
        }

        return 0;
    }

    private getSchemaTypeSignature(schema: any): string {
        if (!schema || typeof schema !== 'object') {
            return 'unknown';
        }

        if (schema.$ref) {
            return schema.$ref;
        }

        if (schema.type === 'array') {
            return `array<${this.getSchemaTypeSignature(schema.items)}>`;
        }

        if (schema.type) {
            return schema.format ? `${schema.type}:${schema.format}` : schema.type;
        }

        if (schema.allOf) {
            return 'allOf';
        }

        if (schema.oneOf) {
            return 'oneOf';
        }

        if (schema.anyOf) {
            return 'anyOf';
        }

        if (schema.properties) {
            return 'object';
        }

        return 'unknown';
    }

    private filterBySeverity(anomalies: Anomaly[], minSeverity: string): Anomaly[] {
        const severityMap = { low: 0, medium: 1, high: 2 };
        const minLevel = severityMap[minSeverity as keyof typeof severityMap] ?? 1;
        return anomalies.filter(a => (severityMap[a.severity as keyof typeof severityMap] ?? 0) >= minLevel);
    }

    private filterByCategories(anomalies: Anomaly[], config: AnomalyDetectionConfig): Anomaly[] {
        let filtered = anomalies;

        if (config.includeCategories && config.includeCategories.length > 0) {
            filtered = filtered.filter(a => config.includeCategories!.includes(a.type));
        }

        if (config.excludeCategories && config.excludeCategories.length > 0) {
            filtered = filtered.filter(a => !config.excludeCategories!.includes(a.type));
        }

        return filtered;
    }

    private calculateSummary(anomalies: Anomaly[]): AnomalySummary {
        const highSeverity = anomalies.filter(a => a.severity === 'high');

        return {
            estimatedPerformanceGain: highSeverity.length > 0 ? 'Multiple high-severity opportunities' : 'Minor improvements',
            bundleSizeImpact: 'Depends on client stack and applied optimizations',
            mainThrottlingPoints: [...new Set(anomalies.map(a => a.benefitCategory))],
            opportunitiesCount: anomalies.length,
            implementationEffort: anomalies.length > 10 ? 'high' : anomalies.length > 5 ? 'medium' : 'low',
        };
    }

    private generateRecommendations(anomalies: Anomaly[]): OptimizationRecommendation[] {
        const recommendations: OptimizationRecommendation[] = [];

        if (anomalies.some(a => a.type === 'batch-endpoints-available')) {
            recommendations.push({
                title: 'Implement auto-batching',
                description: 'Use batch endpoints automatically for multiple sequential requests',
                implementationPath: '--exploit-anomalies',
                priority: 'critical',
                estimatedPerformanceGain: '10-50x throughput',
            });
        }

        if (anomalies.some(a => a.type === 'rate-limit-patterns')) {
            recommendations.push({
                title: 'Add circuit breaker',
                description: 'Automatically handle rate limiting with exponential backoff',
                implementationPath: '--exploit-anomalies',
                priority: 'high',
            });
        }

        if (anomalies.some(a => a.type === 'inconsistent-response-types')) {
            recommendations.push({
                title: 'Standardize responses',
                description: 'Add validation layer to ensure consistent response types',
                implementationPath: 'validation-layer',
                priority: 'medium',
            });
        }

        return recommendations;
    }
}
