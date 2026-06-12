import { Node, SyntaxKind, Type } from 'ts-morph';

import type { ProjectContext } from '../core/ProjectContext';
import type { Contract, Finding, Rule, Stats } from '../types';
import { findBestMatch } from '../utils/fuzzy';

/** Правило проверки вызовов методов сгенерированных сервисов в потребителях API. */
export class ServiceRule implements Rule {
    /**
     * Проверяет вызовы методов сервисов и соответствие их сигнатурам.
     * @param context контекст проекта
     * @param contract контракт сгенерированного API
     * @param stats накопительная статистика использования
     * @returns список найденных проблем
     */
    async check(context: ProjectContext, contract: Contract, stats: Stats): Promise<Finding[]> {
        const findings: Finding[] = [];
        const checker = context.getTypeChecker();

        for (const file of context.getConsumerSourceFiles()) {
            const calls = file.getDescendantsOfKind(SyntaxKind.CallExpression);
            for (const call of calls) {
                const expression = call.getExpression();
                if (!Node.isPropertyAccessExpression(expression)) continue;

                const serviceAccess = expression.getExpression();
                if (!Node.isPropertyAccessExpression(serviceAccess)) continue;

                const serviceName = serviceAccess.getName();
                const methodName = expression.getName();
                if (!contract.services[serviceName]) continue;

                stats.usedMethods.add(`${serviceName}.${methodName}`);

                const methodContract = contract.services[serviceName].find(m => m.name === methodName);
                if (!methodContract) {
                    const suggestion = findBestMatch(
                        methodName,
                        contract.services[serviceName].map(m => m.name)
                    );
                    findings.push({
                        id: 'SERVICE_METHOD_NOT_FOUND',
                        category: suggestion ? 'RENAMED_SYMBOL' : 'MISSING_EXPORT',
                        severity: 'ERROR',
                        message: `Method "${serviceName}.${methodName}" was not found in the generated API.${suggestion ? ` Did you mean "${serviceName}.${suggestion}"?` : ''}`,
                        file: file.getFilePath(),
                        line: call.getStartLineNumber(),
                        context: { suggestion },
                    });
                    continue;
                }

                const args = call.getArguments();
                const serviceDecl = contract.sourceFile
                    .getExportedDeclarations()
                    .get(serviceName)
                    ?.find(d => Node.isClassDeclaration(d));
                const methodDecl = serviceDecl && Node.isClassDeclaration(serviceDecl) ? serviceDecl.getMethod(methodName) : undefined;
                const requiredParams = methodDecl ? methodDecl.getParameters().filter(p => !p.isOptional()) : methodContract.params.filter(p => !p.isOptional);
                if (args.length < requiredParams.length) {
                    findings.push({
                        id: 'SERVICE_ARGUMENTS_COUNT_MISMATCH',
                        category: 'TYPE_MISMATCH',
                        severity: 'ERROR',
                        message: `Method ${serviceName}.${methodName} expects at least ${requiredParams.length} arguments, but got ${args.length}.`,
                        file: file.getFilePath(),
                        line: call.getStartLineNumber(),
                    });
                    continue;
                }

                for (let i = 0; i < Math.min(args.length, methodContract.params.length); i++) {
                    const expectedType = this.getExpectedParameterType(contract, serviceName, methodName, i);
                    if (!expectedType) continue;

                    const providedType = checker.getTypeAtLocation(args[i]);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (!providedType.isAssignableTo(expectedType)) {
                        findings.push({
                            id: 'SERVICE_ARGUMENT_TYPE_MISMATCH',
                            category: 'TYPE_MISMATCH',
                            severity: 'ERROR',
                            message: `Argument #${i + 1} type mismatch in ${serviceName}.${methodName}. Expected ${expectedType.getText()}, got ${providedType.getText()}.`,
                            file: file.getFilePath(),
                            line: args[i].getStartLineNumber(),
                        });
                    }
                }
            }
        }

        return findings;
    }

    private getExpectedParameterType(contract: Contract, serviceName: string, methodName: string, paramIndex: number): Type | undefined {
        const exportedDecl = contract.sourceFile
            .getExportedDeclarations()
            .get(serviceName)
            ?.find(d => Node.isClassDeclaration(d));
        const method = exportedDecl && Node.isClassDeclaration(exportedDecl) ? exportedDecl.getMethod(methodName) : undefined;
        const param = method?.getParameters()[paramIndex];
        return param?.getType();
    }
}
