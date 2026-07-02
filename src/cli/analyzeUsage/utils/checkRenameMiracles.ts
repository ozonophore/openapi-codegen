import type { ProjectContext } from '../../../core/projectProbe';
import type { MiracleEntry } from '../../../core/types/shared/Miracle.model';
import type { Contract, Finding } from '../types';
import type { ApiImportScope } from './apiImportScope';
import { isApiImport } from './apiImportScope';
import { findBestMatch } from './fuzzy';

function lastPathSegment(jsonPath: string | undefined): string | undefined {
    if (!jsonPath) {
        return undefined;
    }

    const normalized = jsonPath.replace(/^\$\.?/, '').replace(/^#/, '');
    const segments = normalized.split(/[./]/).filter(Boolean);
    return segments.at(-1);
}

function resolveMiracleSymbols(miracle: MiracleEntry): { oldSymbol: string; newSymbol: string } | null {
    const oldSymbol = miracle.oldProperty ?? lastPathSegment(miracle.oldPath);
    const newSymbol = miracle.newProperty ?? lastPathSegment(miracle.newPath);

    if (!oldSymbol || !newSymbol || oldSymbol === newSymbol) {
        return null;
    }

    return { oldSymbol, newSymbol };
}

function buildSymbolVariants(symbol: string): string[] {
    const variants = new Set<string>([symbol]);

    if (symbol.endsWith('Schema')) {
        variants.add(symbol.slice(0, -'Schema'.length));
    } else {
        variants.add(`${symbol}Schema`);
    }

    if (symbol.endsWith('Service')) {
        variants.add(symbol.slice(0, -'Service'.length));
    } else {
        variants.add(`${symbol}Service`);
    }

    return [...variants];
}

function collectContractSymbols(contract: Contract): Set<string> {
    const symbols = new Set<string>();

    for (const name of contract.schemas) {
        symbols.add(name);
    }
    for (const name of contract.models) {
        symbols.add(name);
    }
    for (const name of Object.keys(contract.services)) {
        symbols.add(name);
    }
    for (const name of contract.sourceFile.getExportedDeclarations().keys()) {
        symbols.add(name);
    }

    return symbols;
}

function importMatchesOldSymbol(importedName: string, oldSymbol: string): boolean {
    const oldVariants = buildSymbolVariants(oldSymbol);

    if (oldVariants.includes(importedName)) {
        return true;
    }

    return findBestMatch(importedName, oldVariants) !== null;
}

function resolveAvailableNewSymbol(newSymbol: string, contractSymbols: Set<string>, importedName: string): string | null {
    const variants = buildSymbolVariants(newSymbol);

    if (importedName.endsWith('Schema')) {
        const schemaVariant = variants.find(variant => variant.endsWith('Schema') && contractSymbols.has(variant));
        if (schemaVariant) {
            return schemaVariant;
        }
    }

    if (importedName.endsWith('Service')) {
        const serviceVariant = variants.find(variant => variant.endsWith('Service') && contractSymbols.has(variant));
        if (serviceVariant) {
            return serviceVariant;
        }
    }

    for (const variant of variants) {
        if (contractSymbols.has(variant)) {
            return variant;
        }
    }

    return null;
}

/**
 * Post-check: compare RENAME miracles from a diff report with consumer API imports.
 * Emits WARNING findings when the consumer still imports an old symbol after a rename miracle.
 */
export function checkRenameMiracles(context: ProjectContext, contract: Contract, apiScope: ApiImportScope, miracles: MiracleEntry[]): Finding[] {
    const renameMiracles = miracles.filter(miracle => miracle.type === 'RENAME');
    if (renameMiracles.length === 0) {
        return [];
    }

    const contractSymbols = collectContractSymbols(contract);
    const findings: Finding[] = [];
    const seen = new Set<string>();

    for (const file of context.getConsumerSourceFiles()) {
        for (const imp of file.getImportDeclarations()) {
            if (!isApiImport(imp, apiScope)) {
                continue;
            }

            for (const namedImport of imp.getNamedImports()) {
                const importedName = namedImport.getName();

                if (contractSymbols.has(importedName)) {
                    continue;
                }

                for (const miracle of renameMiracles) {
                    const symbols = resolveMiracleSymbols(miracle);
                    if (!symbols) {
                        continue;
                    }

                    const { oldSymbol, newSymbol } = symbols;
                    const availableNewSymbol = resolveAvailableNewSymbol(newSymbol, contractSymbols, importedName);

                    if (!availableNewSymbol || !importMatchesOldSymbol(importedName, oldSymbol)) {
                        continue;
                    }

                    const dedupeKey = `${file.getFilePath()}:${namedImport.getStartLineNumber()}:${importedName}:${availableNewSymbol}`;
                    if (seen.has(dedupeKey)) {
                        continue;
                    }
                    seen.add(dedupeKey);

                    findings.push({
                        id: 'DIFF_RENAME_NOT_APPLIED',
                        category: 'RENAMED_SYMBOL',
                        severity: 'WARNING',
                        message: `Consumer import "${importedName}" was not updated after rename miracle (${oldSymbol} → ${availableNewSymbol}).`,
                        file: file.getFilePath(),
                        line: namedImport.getStartLineNumber(),
                        context: {
                            oldSymbol,
                            newSymbol: availableNewSymbol,
                            miracle,
                        },
                    });
                }
            }
        }
    }

    return findings;
}
