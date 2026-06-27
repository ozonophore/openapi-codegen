import type { ChangeDetectionResult, SpecChange } from '../../migration/types';
import type { SemanticDiffChange, SemanticDiffReport, SemanticDiffSummary } from '../../semanticDiff/analyzeOpenApiDiff';

export type AdaptSemanticToChangeDetectionOptions = {
    allowBreaking?: boolean;
};

function hasNoBreakingWithoutFlagViolation(report: SemanticDiffReport): boolean {
    return report.governance.violations.some(violation => violation.ruleId === 'NO_BREAKING_WITHOUT_FLAG');
}

function hasWideningTypeChange(report: SemanticDiffReport): boolean {
    return report.changes.some(change => change.type === 'model.property.type.changed' && change.severity === 'non-breaking');
}

function isAdditionChange(change: SemanticDiffChange): boolean {
    return change.type.endsWith('.added') || change.type.includes('.added');
}

function mapSpecChangeType(change: SemanticDiffChange): SpecChange['type'] {
    if (change.severity === 'breaking') {
        return 'breaking';
    }

    if (isAdditionChange(change)) {
        return 'addition';
    }

    return 'non-breaking';
}

function extractAffectedEndpoints(change: SemanticDiffChange): string[] | undefined {
    const operationMatch = change.path.match(/^#\/paths\/([A-Z]+)\s+(\S+)/);
    if (operationMatch) {
        return [operationMatch[2]];
    }

    const schemaMatch = change.path.match(/^#\/components\/schemas\/([^/]+)/);
    if (schemaMatch && change.severity === 'breaking' && change.type.includes('required')) {
        return [schemaMatch[1]];
    }

    return undefined;
}

function mapSemanticChangeToSpecChange(change: SemanticDiffChange): SpecChange {
    const type = mapSpecChangeType(change);
    const migrationRequired = type === 'breaking';

    return {
        type,
        path: change.path,
        oldValue: change.from,
        newValue: change.to,
        description: change.message,
        affectedEndpoints: extractAffectedEndpoints(change),
        migrationRequired,
        workaround: migrationRequired ? 'Review semantic diff and update client code accordingly' : undefined,
    };
}

function buildSummary(summary: SemanticDiffSummary): string {
    const parts: string[] = [];

    if (summary.breaking > 0) {
        parts.push(`${summary.breaking} breaking change(s)`);
    }
    if (summary.nonBreaking > 0) {
        parts.push(`${summary.nonBreaking} non-breaking change(s)`);
    }
    if (summary.informational > 0) {
        parts.push(`${summary.informational} informational change(s)`);
    }

    if (parts.length === 0) {
        return 'No changes detected';
    }

    return parts.join(', ');
}

function buildSuggestedActions(report: SemanticDiffReport): string[] {
    const actions: string[] = [];
    const breakingChanges = report.changes.filter(change => change.severity === 'breaking');
    const summaryText = buildSummary(report.summary);

    if (report.changes.length > 0) {
        actions.push(summaryText);
    }

    if (breakingChanges.length > 0) {
        actions.push('Review all breaking changes carefully before upgrading');
        actions.push('Create a migration guide for your team');
        actions.push('Plan a gradual migration using traffic splitting');

        for (const change of breakingChanges.slice(0, 3)) {
            actions.push(change.message);
        }
    }

    if (report.changes.some(change => isAdditionChange(change))) {
        actions.push('Review new endpoints and integrate if needed');
        actions.push('Check for improved performance or capabilities');
    }

    if (report.changes.length > 10) {
        actions.push('Consider staging the migration across multiple phases');
    }

    return actions;
}

/**
 * Преобразует семантический diff-отчёт в результат ChangeDetector для Marauder/heal.
 * @param report семантический diff-отчёт
 * @param [options] опции адаптации, включая allowBreaking (зарезервировано для governance)
 * @returns результат детекции изменений в формате migration/heal
 */
export function adaptSemanticToChangeDetection(report: SemanticDiffReport, options: AdaptSemanticToChangeDetectionOptions = {}): ChangeDetectionResult {
    void options.allowBreaking;

    const changes = report.changes.map(mapSemanticChangeToSpecChange);
    const hasBreaking = changes.some(change => change.type === 'breaking');
    const governanceRequiresReview = hasNoBreakingWithoutFlagViolation(report);
    const wideningRequiresReview = hasWideningTypeChange(report);
    const autoApplicable = !hasBreaking && !governanceRequiresReview && !wideningRequiresReview && changes.every(change => !change.migrationRequired);
    const requiresUserReview = changes.some(change => change.type === 'breaking' || change.migrationRequired) || governanceRequiresReview || wideningRequiresReview;

    return {
        hasChanges: changes.length > 0,
        changes,
        summary: buildSummary(report.summary),
        autoApplicable,
        requiresUserReview,
        suggestedActions: buildSuggestedActions(report),
    };
}
