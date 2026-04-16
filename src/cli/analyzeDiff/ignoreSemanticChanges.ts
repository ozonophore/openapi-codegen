import { SemanticDiffReport } from '../../core/semanticDiff/analyzeOpenApiDiff';
import { matchesIgnoreRule } from './ignoreRules';
import { DiffEntry, IgnoreRule } from './types';

type RecommendationReason = 'HAS_BREAKING_CHANGES' | 'HAS_BACKWARD_COMPATIBLE_CHANGES' | 'HAS_INFORMATIONAL_ONLY_CHANGES' | 'NO_API_SURFACE_CHANGES';

/**
 * Rebuilds summary counters from current semantic changes.
 */
function rebuildSummary(report: SemanticDiffReport): SemanticDiffReport['summary'] {
    return report.changes.reduce(
        (acc, change) => {
            if (change.severity === 'breaking') {
                acc.breaking += 1;
            } else if (change.severity === 'non-breaking') {
                acc.nonBreaking += 1;
            } else {
                acc.informational += 1;
            }

            return acc;
        },
        { breaking: 0, nonBreaking: 0, informational: 0 }
    );
}

/**
 * Rebuilds recommendation based on recalculated summary.
 */
function rebuildRecommendation(summary: SemanticDiffReport['summary']): SemanticDiffReport['recommendation'] {
    let semver: 'major' | 'minor' | 'patch' = 'patch';
    let confidence: 'high' | 'medium' | 'low' = 'high';
    let reason = 'No breaking or feature-level changes detected.';
    let reasons: RecommendationReason[] = ['NO_API_SURFACE_CHANGES'];

    if (summary.breaking > 0) {
        semver = 'major';
        confidence = summary.breaking >= 3 ? 'high' : 'medium';
        reason = 'Breaking changes detected.';
        reasons = ['HAS_BREAKING_CHANGES'];
    } else if (summary.nonBreaking > 0) {
        semver = 'minor';
        confidence = summary.nonBreaking >= 3 ? 'high' : 'medium';
        reason = 'Backward-compatible feature changes detected.';
        reasons = ['HAS_BACKWARD_COMPATIBLE_CHANGES'];
    } else if (summary.informational > 0) {
        semver = 'patch';
        confidence = 'medium';
        reason = 'Only informational changes detected.';
        reasons = ['HAS_INFORMATIONAL_ONLY_CHANGES'];
    }

    return { semver, confidence, reason, reasons };
}

/**
 * Applies legacy analyze.ignore rules to semantic changes and returns ignored count.
 */
export function filterSemanticChangesByIgnoreRules(report: SemanticDiffReport, ignoreRules: IgnoreRule[]): { report: SemanticDiffReport; ignored: number } {
    if (!ignoreRules.length) {
        return { report, ignored: 0 };
    }

    let ignored = 0;
    const filteredChanges = report.changes.filter(change => {
        const diffEntry: DiffEntry = {
            action: 'changed',
            path: change.path,
            severity: 'info',
        };
        const ignoredByRule = ignoreRules.some(rule => matchesIgnoreRule(diffEntry, rule));
        if (ignoredByRule) {
            ignored += 1;
            return false;
        }
        return true;
    });

    if (ignored === 0) {
        return { report, ignored: 0 };
    }

    const summary = rebuildSummary({ ...report, changes: filteredChanges });

    return {
        report: {
            ...report,
            changes: filteredChanges,
            summary,
            recommendation: rebuildRecommendation(summary),
        },
        ignored,
    };
}
