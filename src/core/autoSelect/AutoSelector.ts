import { ProjectProbe } from '../projectProbe';
import { HttpClient } from '../types/enums/HttpClient.enum';
import { ValidationLibrary } from '../types/enums/ValidationLibrary.enum';
import { AutoSelectConfig, AutoSelectResult, ProjectAnalysis, Recommendation, SelectionExplanation } from './types';

export class AutoSelector {
    private readonly DEFAULT_CONFIG: AutoSelectConfig = {
        enabled: true,
        strict: false,
        preferSmallBundles: false,
        preferStandards: false,
        detectionRules: [],
        customRules: [],
    };

    /**
     * Analyze target directory and select optimal components
     */
    public selectOptimal(targetDir: string, config?: Partial<AutoSelectConfig>): AutoSelectResult {
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };

        const analysis = this.analyzeProject(targetDir, mergedConfig);

        // Apply custom rules first (highest priority wins)
        const sortedRules = [...(mergedConfig.customRules || [])].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

        for (const rule of sortedRules) {
            if (rule.condition(analysis)) {
                const explanations: SelectionExplanation[] = [];
                const recommendations: Recommendation[] = [];

                if (rule.validator) {
                    explanations.push({
                        component: 'validator',
                        selected: rule.validator,
                        reasons: [`Custom rule "${rule.name}" matched`],
                    });
                }

                if (rule.httpClient) {
                    explanations.push({
                        component: 'httpClient',
                        selected: rule.httpClient,
                        reasons: [`Custom rule "${rule.name}" matched`],
                    });
                }

                return {
                    validator: rule.validator || this.selectValidator(analysis, mergedConfig),
                    httpClient: rule.httpClient || this.selectHttpClient(analysis, mergedConfig),
                    explanations: explanations.length > 0 ? explanations : this.buildExplanations(analysis, mergedConfig),
                    recommendations: recommendations.length > 0 ? recommendations : this.generateRecommendations(analysis),
                };
            }
        }

        // Default selection logic
        return {
            validator: this.selectValidator(analysis, mergedConfig),
            httpClient: this.selectHttpClient(analysis, mergedConfig),
            explanations: this.buildExplanations(analysis, mergedConfig),
            recommendations: this.generateRecommendations(analysis),
        };
    }

    /**
     * Analyze project structure and dependencies via pluggable detection rules
     */
    private analyzeProject(targetDir: string, config: AutoSelectConfig): ProjectAnalysis {
        return ProjectProbe.probePackageJson(targetDir, { detectionRules: config.detectionRules });
    }

    /**
     * Select optimal validator based on analysis
     */
    private selectValidator(analysis: ProjectAnalysis, config: AutoSelectConfig): ValidationLibrary {
        // If strict mode and existing validators, prefer the first supported one
        if (config.strict && analysis.packageJson.existingValidators.length > 0) {
            return analysis.packageJson.existingValidators[0];
        }

        // If already has validators, use the most robust supported one
        if (analysis.packageJson.existingValidators.length > 0) {
            if (analysis.packageJson.existingValidators.includes(ValidationLibrary.ZOD)) {
                return ValidationLibrary.ZOD;
            }
            if (analysis.packageJson.existingValidators.includes(ValidationLibrary.JOI)) {
                return ValidationLibrary.JOI;
            }
            if (analysis.packageJson.existingValidators.includes(ValidationLibrary.YUP)) {
                return ValidationLibrary.YUP;
            }
        }

        // Prefer web-standard / widely adopted libraries when configured
        if (config.preferStandards) {
            return ValidationLibrary.ZOD;
        }

        // Bundle size constraints: prefer no validation or Zod when small bundles matter
        if (analysis.performanceRequirements.requiresSmallBundle && config.preferSmallBundles) {
            return ValidationLibrary.NONE;
        }

        // Default: no validation library unless detected in dependencies
        return ValidationLibrary.NONE;
    }

    /**
     * Select optimal HTTP client based on analysis
     */
    private selectHttpClient(analysis: ProjectAnalysis, config: AutoSelectConfig): HttpClient {
        // If strict mode and existing clients, prefer the first supported one
        if (config.strict && analysis.packageJson.existingHttpClients.length > 0) {
            return analysis.packageJson.existingHttpClients[0];
        }

        // If already has HTTP clients, use the first supported one
        if (analysis.packageJson.existingHttpClients.length > 0) {
            return analysis.packageJson.existingHttpClients[0];
        }

        // Prefer Fetch API (web standard) when configured
        if (config.preferStandards) {
            return HttpClient.FETCH;
        }

        // Browser targets: use Fetch (modern, built-in)
        if (analysis.deploymentTarget === 'browser') {
            return HttpClient.FETCH;
        }

        // Node.js targets: use Node HTTP client
        if (analysis.deploymentTarget === 'nodejs') {
            return HttpClient.NODE;
        }

        // Edge functions: use Fetch (lightweight, serverless-friendly)
        if (analysis.deploymentTarget === 'edge') {
            return HttpClient.FETCH;
        }

        // React Native: use Fetch
        if (analysis.deploymentTarget === 'react-native') {
            return HttpClient.FETCH;
        }

        // Default fallback: Axios (most compatible)
        return HttpClient.AXIOS;
    }

    /**
     * Build explanation for selections
     */
    private buildExplanations(analysis: ProjectAnalysis, config: AutoSelectConfig): SelectionExplanation[] {
        const validator = this.selectValidator(analysis, config);
        const httpClient = this.selectHttpClient(analysis, config);

        const explanations: SelectionExplanation[] = [];

        // Validator explanation
        const validatorReasons: string[] = [];
        if (analysis.packageJson.existingValidators.includes(validator)) {
            validatorReasons.push(`Already installed in dependencies`);
        }
        if (analysis.performanceRequirements.requiresSmallBundle && validator === ValidationLibrary.ZOD) {
            validatorReasons.push(`Supported lightweight validator for small bundles`);
        }
        if (validator === ValidationLibrary.ZOD) {
            validatorReasons.push(`Most popular and well-maintained`);
        }

        explanations.push({
            component: 'validator',
            selected: validator,
            reasons: validatorReasons.length > 0 ? validatorReasons : ['Default recommendation'],
        });

        // HTTP Client explanation
        const clientReasons: string[] = [];
        if (analysis.packageJson.existingHttpClients.includes(httpClient)) {
            clientReasons.push(`Already installed in dependencies`);
        }
        if (analysis.deploymentTarget === 'browser' && httpClient === HttpClient.FETCH) {
            clientReasons.push(`Built-in for modern browsers`);
        }
        if (analysis.deploymentTarget === 'nodejs' && httpClient === HttpClient.NODE) {
            clientReasons.push(`Native Node.js HTTP client`);
        }
        if (analysis.deploymentTarget === 'edge' && httpClient === HttpClient.FETCH) {
            clientReasons.push(`Serverless-friendly, minimal overhead`);
        }

        explanations.push({
            component: 'httpClient',
            selected: httpClient,
            reasons: clientReasons.length > 0 ? clientReasons : ['Default recommendation'],
        });

        return explanations;
    }

    /**
     * Generate optimization recommendations
     */
    private generateRecommendations(analysis: ProjectAnalysis): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Bundle size recommendations
        if (analysis.performanceRequirements.requiresSmallBundle && !analysis.bundleSize.hasTreeShaking) {
            recommendations.push({
                category: 'bundle-size',
                title: 'Enable tree-shaking',
                description: 'Set "sideEffects": false in package.json to enable tree-shaking and reduce bundle size',
                priority: 'high',
                action: 'Set "sideEffects": false in package.json',
            });
        }

        // Performance recommendations
        if (analysis.performanceRequirements.hasBatchEndpoints) {
            recommendations.push({
                category: 'performance',
                title: 'Batch API requests',
                description: 'Use batch endpoints for multiple requests to improve throughput',
                priority: 'high',
            });
        }

        // React Native specific
        if (analysis.deploymentTarget === 'react-native') {
            recommendations.push({
                category: 'compatibility',
                title: 'Test on target platform',
                description: 'Generated code uses platform-compatible APIs, but test thoroughly on target React Native version',
                priority: 'medium',
            });
        }

        return recommendations;
    }
}
