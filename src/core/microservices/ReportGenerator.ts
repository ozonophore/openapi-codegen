/**
 * Unified Report Generator
 * Generates comprehensive reports in multiple formats (JSON, Markdown, HTML)
 */

import { AvatarSwarm, RecommendationReport, ReportSection, SwarmAnalysisResult, UnifiedReport } from './types';

export class ReportGenerator {
    private readonly templates = {
        json: this.generateJsonReport,
        markdown: this.generateMarkdownReport,
        html: this.generateHtmlReport,
    };

    /**
     * Generate comprehensive unified report
     */
    public generateUnifiedReport(
        swarm: AvatarSwarm,
        analysisResult: SwarmAnalysisResult,
        recommendations: RecommendationReport,
        format: 'json' | 'markdown' | 'html' | 'all' = 'markdown'
    ): UnifiedReport | Record<string, UnifiedReport> {
        const baseReport: UnifiedReport = {
            id: `report-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: `Avatar Swarm Report: ${swarm.name}`,
            type: 'comprehensive',
            format: format as any,
            sections: this.buildReportSections(swarm, analysisResult, recommendations),
            metadata: {
                author: 'Avatar Swarm Generator',
                version: '1.0.0',
                environment: 'production',
                generationDuration: 0,
                dataPoints: this.calculateDataPoints(swarm, analysisResult, recommendations),
            },
        };

        if (format === 'all') {
            return {
                json: this.generateJsonReport(swarm, analysisResult, recommendations),
                markdown: this.generateMarkdownReport(swarm, analysisResult, recommendations),
                html: this.generateHtmlReport(swarm, analysisResult, recommendations),
            };
        }

        switch (format) {
            case 'json':
                return this.generateJsonReport(swarm, analysisResult, recommendations);
            case 'markdown':
                return this.generateMarkdownReport(swarm, analysisResult, recommendations);
            case 'html':
                return this.generateHtmlReport(swarm, analysisResult, recommendations);
            default:
                return baseReport;
        }
    }

    /**
     * Build report sections
     */
    private buildReportSections(swarm: AvatarSwarm, analysisResult: SwarmAnalysisResult, recommendations: RecommendationReport): ReportSection[] {
        const sections: ReportSection[] = [];

        // Executive Summary
        sections.push({
            id: 'summary',
            title: 'Executive Summary',
            type: 'summary',
            content: this.buildExecutiveSummary(swarm, analysisResult, recommendations),
            priority: 1,
        });

        // System Overview
        sections.push({
            id: 'overview',
            title: 'System Overview',
            type: 'details',
            content: this.buildSystemOverview(swarm, analysisResult),
            priority: 2,
        });

        // Health Status
        sections.push({
            id: 'health',
            title: 'Health Status',
            type: 'metrics',
            content: this.buildHealthStatus(swarm),
            priority: 3,
        });

        // Recommendations
        sections.push({
            id: 'recommendations',
            title: 'Recommendations',
            type: 'recommendations',
            content: this.buildRecommendationsSection(recommendations),
            priority: 4,
        });

        // Performance Metrics
        sections.push({
            id: 'performance',
            title: 'Performance Metrics',
            type: 'metrics',
            content: this.buildPerformanceMetrics(analysisResult),
            priority: 5,
        });

        // Implementation Timeline
        sections.push({
            id: 'timeline',
            title: 'Implementation Roadmap',
            type: 'timeline',
            content: this.buildImplementationTimeline(recommendations),
            priority: 6,
        });

        return sections;
    }

    /**
     * Build executive summary
     */
    private buildExecutiveSummary(swarm: AvatarSwarm, analysisResult: SwarmAnalysisResult, recommendations: RecommendationReport): string {
        return `
# Executive Summary

**Swarm Health:** ${swarm.healthStatus.overallHealth.toUpperCase()}

Your API swarm consists of **${swarm.metadata.totalAvatars} services** managing **${swarm.metadata.totalEndpoints} endpoints** with a total bundle size of **${(swarm.metadata.estimatedTotalBundleSize / 1024 / 1024).toFixed(1)}MB**.

## Key Findings

- **Overall System Health:** ${recommendations.summary.overallSystemHealth}
- **Critical Issues:** ${recommendations.criticalRecommendations}
- **Actionable Recommendations:** ${recommendations.totalRecommendations}
- **Average Latency:** ${analysisResult.performanceMetrics.averageLatency}ms
- **Error Rate:** ${(analysisResult.performanceMetrics.errorRate * 100).toFixed(3)}%
- **Cache Hit Rate:** ${(analysisResult.performanceMetrics.cacheHitRate * 100).toFixed(1)}%

## Estimated Impact of Recommendations

Implementing the recommended optimizations could provide:
- **Performance Gain:** ${recommendations.summary.estimatedCumulativeBenefit}
- **System Reliability:** ${recommendations.criticalRecommendations > 0 ? 'Improvements needed' : 'Good baseline'}
- **Operational Efficiency:** ${swarm.metadata.totalAvatars > 10 ? 'Opportunities for consolidation' : 'Well-structured'}

Next Steps: Review critical recommendations and implementation roadmap below.
    `;
    }

    /**
     * Build system overview
     */
    private buildSystemOverview(swarm: AvatarSwarm, analysisResult: SwarmAnalysisResult): string {
        const avatarList = swarm.avatars.map(a => `  - **${a.name}** (v${a.specVersion}): ${a.capabilities.length} capabilities`).join('\n');

        const dataFlows = analysisResult.dataFlows.map(df => `  - ${df.from} → ${df.to} (${df.frequency})`).join('\n');

        return `
## Avatars

${avatarList}

## Service Dependencies

${dataFlows || '  No dependencies detected'}

## Coordination Strategy

**Strategy:** ${swarm.coordinator.strategy.toUpperCase()}
**Rules:** ${swarm.rules.length}
**Consensus Threshold:** ${(swarm.metadata.consensusThreshold * 100).toFixed(0)}%
    `;
    }

    /**
     * Build health status section
     */
    private buildHealthStatus(swarm: AvatarSwarm): string {
        const avatarHealthList = Array.from(swarm.healthStatus.avatarHealth.entries())
            .map(([id, health]) => `  - ${id}: **${health.toUpperCase()}**`)
            .join('\n');

        const issues = swarm.healthStatus.issues.map(i => `  - [${i.severity.toUpperCase()}] ${i.component}: ${i.description} (${i.timestamp})`).join('\n');

        return `
## Overall Health: ${swarm.healthStatus.overallHealth.toUpperCase()}

### Avatar Status

${avatarHealthList}

### Issues

${issues || '  No issues detected'}

### Last Check

${swarm.healthStatus.lastCheck}
    `;
    }

    /**
     * Build recommendations section
     */
    private buildRecommendationsSection(recommendations: RecommendationReport): string {
        const criticalRecs = recommendations.recommendations
            .filter(r => r.priority === 'critical')
            .map(r => `  1. **${r.title}** - ${r.description}`)
            .join('\n');

        const highRecs = recommendations.recommendations
            .filter(r => r.priority === 'high')
            .map(r => `  2. **${r.title}** - ${r.description}`)
            .join('\n');

        return `
## Critical Recommendations

${criticalRecs || '  No critical recommendations'}

## High Priority Recommendations

${highRecs || '  No high priority recommendations'}

## Implementation Guidance

Review the Implementation Roadmap section for a phased approach to implementing these recommendations.
    `;
    }

    /**
     * Build performance metrics section
     */
    private buildPerformanceMetrics(analysisResult: SwarmAnalysisResult): string {
        const metrics = analysisResult.performanceMetrics;

        return `
## Current Performance

| Metric | Value |
|--------|-------|
| Average Latency | ${metrics.averageLatency}ms |
| P95 Latency | ${metrics.p95Latency}ms |
| P99 Latency | ${metrics.p99Latency}ms |
| Throughput | ${metrics.throughput} req/s |
| Error Rate | ${(metrics.errorRate * 100).toFixed(3)}% |
| Cache Hit Rate | ${(metrics.cacheHitRate * 100).toFixed(1)}% |
| Consensus Overhead | ${metrics.consensusOverhead}ms |
    `;
    }

    /**
     * Build implementation timeline
     */
    private buildImplementationTimeline(recommendations: RecommendationReport): string {
        let timeline = '';

        for (const phase of recommendations.summary.implementationRoadmap) {
            timeline += `
### Phase ${phase.phase}: ${phase.name}

**Duration:** ${phase.duration}

**Expected Outcomes:**
${phase.expectedOutcomes.map(o => `  - ${o}`).join('\n')}

**Success Criteria:**
${phase.successCriteria.map(c => `  - ${c}`).join('\n')}
      `;
        }

        return timeline;
    }

    /**
     * Generate JSON report
     */
    private generateJsonReport(swarm: AvatarSwarm, analysisResult: SwarmAnalysisResult, recommendations: RecommendationReport): UnifiedReport {
        return {
            id: `report-json-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: `Avatar Swarm Report: ${swarm.name}`,
            type: 'comprehensive',
            format: 'json',
            sections: [
                {
                    id: 'swarm-summary',
                    title: 'Swarm Summary',
                    type: 'summary',
                    content: {
                        swarmId: swarm.id,
                        name: swarm.name,
                        totalAvatars: swarm.metadata.totalAvatars,
                        totalEndpoints: swarm.metadata.totalEndpoints,
                        totalModels: swarm.metadata.totalModels,
                        bundleSize: swarm.metadata.estimatedTotalBundleSize,
                        health: swarm.healthStatus.overallHealth,
                        createdAt: swarm.metadata.createdAt,
                    },
                    priority: 1,
                },
                {
                    id: 'avatars-detail',
                    title: 'Avatars Detail',
                    type: 'details',
                    content: swarm.avatars.map(a => ({
                        id: a.id,
                        name: a.name,
                        specVersion: a.specVersion,
                        capabilities: a.capabilities.length,
                        autonomyLevel: a.autonomyLevel,
                        bundleSize: a.metadata.performanceProfile?.estimatedBundleSize,
                    })),
                    priority: 2,
                },
                {
                    id: 'performance-metrics',
                    title: 'Performance Metrics',
                    type: 'metrics',
                    content: analysisResult.performanceMetrics,
                    priority: 3,
                },
                {
                    id: 'recommendations-list',
                    title: 'Recommendations',
                    type: 'recommendations',
                    content: recommendations.recommendations.map(r => ({
                        id: r.id,
                        title: r.title,
                        category: r.category,
                        priority: r.priority,
                        confidence: r.confidenceScore,
                        effort: r.implementationEffort,
                        impact: r.estimatedImpact,
                    })),
                    priority: 4,
                },
            ],
            metadata: {
                author: 'Avatar Swarm Report Generator',
                version: '1.0.0',
                environment: 'production',
                generationDuration: 0,
                dataPoints: 0,
            },
            jsonApi: {
                swarm,
                analysis: analysisResult,
                recommendations,
            },
        };
    }

    /**
     * Generate Markdown report
     */
    private generateMarkdownReport(swarm: AvatarSwarm, analysisResult: SwarmAnalysisResult, recommendations: RecommendationReport): UnifiedReport {
        const sections = this.buildReportSections(swarm, analysisResult, recommendations);
        const markdownContent = this.buildMarkdownContent(sections);

        return {
            id: `report-md-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: `Avatar Swarm Report: ${swarm.name}`,
            type: 'comprehensive',
            format: 'markdown',
            sections,
            markdownContent,
            metadata: {
                author: 'Avatar Swarm Report Generator',
                version: '1.0.0',
                environment: 'production',
                generationDuration: 0,
                dataPoints: this.calculateDataPoints(swarm, analysisResult, recommendations),
            },
        };
    }

    /**
     * Assemble markdown document from report sections
     */
    private buildMarkdownContent(sections: ReportSection[]): string {
        return sections
            .slice()
            .sort((a, b) => a.priority - b.priority)
            .map(section => {
                const content = typeof section.content === 'string' ? section.content.trim() : '';
                return `# ${section.title}\n\n${content}`;
            })
            .join('\n\n---\n\n');
    }

    /**
     * Generate HTML report
     */
    private generateHtmlReport(swarm: AvatarSwarm, analysisResult: SwarmAnalysisResult, recommendations: RecommendationReport): UnifiedReport {
        const htmlDashboard = this.generateHtmlDashboard(swarm, analysisResult, recommendations);

        return {
            id: `report-html-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: `Avatar Swarm Report: ${swarm.name}`,
            type: 'comprehensive',
            format: 'html',
            sections: this.buildReportSections(swarm, analysisResult, recommendations),
            metadata: {
                author: 'Avatar Swarm Report Generator',
                version: '1.0.0',
                environment: 'production',
                generationDuration: 0,
                dataPoints: this.calculateDataPoints(swarm, analysisResult, recommendations),
            },
            htmlDashboard,
        };
    }

    /**
     * Generate HTML dashboard
     */
    private generateHtmlDashboard(swarm: AvatarSwarm, analysisResult: SwarmAnalysisResult, recommendations: RecommendationReport): string {
        return `
<!DOCTYPE html>
<html>
<head>
  <title>Avatar Swarm Report: ${swarm.name}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; }
    header h1 { font-size: 32px; margin-bottom: 10px; }
    header p { font-size: 16px; opacity: 0.9; }
    .content { padding: 40px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
    .metric-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; }
    .metric-card h3 { font-size: 14px; color: #666; text-transform: uppercase; margin-bottom: 10px; }
    .metric-card .value { font-size: 28px; font-weight: bold; color: #667eea; }
    .health-good { border-left-color: #28a745; }
    .health-warning { border-left-color: #ffc107; }
    .health-critical { border-left-color: #dc3545; }
    .recommendations-list { margin: 30px 0; }
    .recommendation-item { background: #f8f9fa; padding: 20px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .recommendation-priority { font-weight: bold; font-size: 12px; text-transform: uppercase; display: inline-block; margin-right: 10px; }
    .priority-critical { color: #dc3545; }
    .priority-high { color: #fd7e14; }
    .priority-medium { color: #ffc107; }
    .priority-low { color: #28a745; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #dee2e6; }
    table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
    footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Avatar Swarm Report</h1>
      <p>${swarm.name} • Generated ${new Date().toLocaleString()}</p>
    </header>
    
    <div class="content">
      <h2>Health Status</h2>
      <div class="metrics-grid">
        <div class="metric-card health-${swarm.healthStatus.overallHealth === 'healthy' ? 'good' : 'critical'}">
          <h3>Overall Health</h3>
          <div class="value">${swarm.healthStatus.overallHealth.toUpperCase()}</div>
        </div>
        <div class="metric-card">
          <h3>Total Avatars</h3>
          <div class="value">${swarm.metadata.totalAvatars}</div>
        </div>
        <div class="metric-card">
          <h3>Total Endpoints</h3>
          <div class="value">${swarm.metadata.totalEndpoints}</div>
        </div>
        <div class="metric-card">
          <h3>Bundle Size</h3>
          <div class="value">${(swarm.metadata.estimatedTotalBundleSize / 1024 / 1024).toFixed(1)}MB</div>
        </div>
      </div>

      <h2>Performance Metrics</h2>
      <table>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Average Latency</td>
          <td>${analysisResult.performanceMetrics.averageLatency}ms</td>
        </tr>
        <tr>
          <td>P95 Latency</td>
          <td>${analysisResult.performanceMetrics.p95Latency}ms</td>
        </tr>
        <tr>
          <td>Throughput</td>
          <td>${analysisResult.performanceMetrics.throughput} req/s</td>
        </tr>
        <tr>
          <td>Error Rate</td>
          <td>${(analysisResult.performanceMetrics.errorRate * 100).toFixed(3)}%</td>
        </tr>
        <tr>
          <td>Cache Hit Rate</td>
          <td>${(analysisResult.performanceMetrics.cacheHitRate * 100).toFixed(1)}%</td>
        </tr>
      </table>

      <h2>Recommendations (${recommendations.totalRecommendations})</h2>
      <div class="recommendations-list">
        ${recommendations.recommendations
            .slice(0, 10)
            .map(
                r => `
          <div class="recommendation-item">
            <span class="recommendation-priority priority-${r.priority}">${r.priority}</span>
            <strong>${r.title}</strong>
            <p style="margin-top: 10px; color: #666;">${r.description}</p>
            <div style="margin-top: 10px; font-size: 12px; color: #999;">
              Effort: ${r.implementationEffort} • Confidence: ${(r.confidenceScore * 100).toFixed(0)}%
            </div>
          </div>
        `
            )
            .join('')}
      </div>
    </div>

    <footer>
      <p>Avatar Swarm Report Generator v1.0.0 | Powered by OpenAPI Codegen</p>
    </footer>
  </div>
</body>
</html>
    `;
    }

    /**
     * Calculate total data points in report
     */
    private calculateDataPoints(swarm: AvatarSwarm, analysisResult: SwarmAnalysisResult, recommendations: RecommendationReport): number {
        return swarm.avatars.length + analysisResult.dataFlows.length + recommendations.recommendations.length + swarm.healthStatus.issues.length;
    }

    /**
     * Generate CI/CD friendly JSON output
     */
    public generateCiOutput(recommendations: RecommendationReport): any {
        return {
            exit_code: recommendations.criticalRecommendations > 0 ? 1 : 0,
            total_recommendations: recommendations.totalRecommendations,
            critical_count: recommendations.criticalRecommendations,
            recommendations: recommendations.recommendations.map(r => ({
                id: r.id,
                title: r.title,
                priority: r.priority,
                category: r.category,
            })),
        };
    }
}
