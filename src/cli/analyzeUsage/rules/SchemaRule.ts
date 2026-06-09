import { SyntaxKind } from 'ts-morph';

import type { ProjectContext } from '../core/ProjectContext';
import type { Contract, Finding, Rule, Stats } from '../types';
import { findBestMatch } from '../utils/fuzzy';

export class SchemaRule implements Rule {
    async check(context: ProjectContext, contract: Contract, stats: Stats): Promise<Finding[]> {
        const findings: Finding[] = [];
        const knownSchemas = new Set(contract.schemas);

        for (const file of context.getConsumerSourceFiles()) {
            const imports = file.getImportDeclarations();

            for (const imp of imports) {
                const moduleName = imp.getModuleSpecifierValue();
                if (moduleName !== '@lom-api' && !moduleName.startsWith('@lom-api/')) {
                    continue;
                }

                for (const namedImport of imp.getNamedImports()) {
                    const importedName = namedImport.getName();
                    if (!importedName.endsWith('Schema')) continue;

                    const localName = namedImport.getAliasNode()?.getText() || importedName;
                    if (!knownSchemas.has(importedName)) {
                        const suggestion = findBestMatch(importedName, contract.schemas);
                        findings.push({
                            id: 'SCHEMA_NOT_FOUND',
                            category: suggestion ? 'RENAMED_SYMBOL' : 'MISSING_EXPORT',
                            severity: 'ERROR',
                            message: `Schema "${importedName}" was not found in the API.${suggestion ? ` Did you mean "${suggestion}"?` : ''}`,
                            file: file.getFilePath(),
                            line: namedImport.getStartLineNumber(),
                            context: { suggestion },
                        });
                        continue;
                    }

                    const identifiers = file.getDescendantsOfKind(SyntaxKind.Identifier).filter(id => id.getText() === localName);
                    const usedOutsideImport = identifiers.some(id => id.getFirstAncestorByKind(SyntaxKind.ImportDeclaration) == null);

                    if (usedOutsideImport) {
                        stats.usedSchemas.add(importedName);
                    }
                }
            }
        }

        return findings;
    }
}
