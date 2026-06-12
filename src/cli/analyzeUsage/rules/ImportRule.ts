import type { ProjectContext } from '../../../core/projectProbe';
import type { Contract, Finding, Rule, Stats } from '../types';
import type { ApiImportScope } from '../utils/apiImportScope';
import { getAllowedExportsForImport, isApiImport } from '../utils/apiImportScope';
import { findBestMatch } from '../utils/fuzzy';

export class ImportRule implements Rule {
    async check(
        context: ProjectContext,
        contract: Contract,

        _stats: Stats,
        apiScope: ApiImportScope
    ): Promise<Finding[]> {
        const findings: Finding[] = [];

        for (const file of context.getConsumerSourceFiles()) {
            for (const imp of file.getImportDeclarations()) {
                if (!isApiImport(imp, apiScope)) {
                    continue;
                }

                const moduleName = imp.getModuleSpecifierValue();
                const importedSource = imp.getModuleSpecifierSourceFile();
                if (!importedSource) {
                    findings.push({
                        id: 'INVALID_IMPORT_PATH',
                        category: 'INVALID_IMPORT',
                        severity: 'ERROR',
                        message: `Import "${moduleName}" could not be resolved.`,
                        file: file.getFilePath(),
                        line: imp.getStartLineNumber(),
                    });
                    continue;
                }

                const allowedExports = getAllowedExportsForImport(imp, apiScope, contract);

                for (const namedImport of imp.getNamedImports()) {
                    const importedName = namedImport.getName();
                    if (allowedExports.has(importedName)) continue;

                    const suggestion = findBestMatch(importedName, [...allowedExports]);
                    findings.push({
                        id: 'INVALID_IMPORT_NAME',
                        category: suggestion ? 'RENAMED_SYMBOL' : 'MISSING_EXPORT',
                        severity: 'ERROR',
                        message: `Import "${importedName}" is not exported by "${moduleName}".${suggestion ? ` Did you mean "${suggestion}"?` : ''}`,
                        file: file.getFilePath(),
                        line: namedImport.getStartLineNumber(),
                        context: { suggestion },
                    });
                }
            }
        }

        return findings;
    }
}
