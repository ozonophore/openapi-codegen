import type { ExportedDeclarations } from 'ts-morph';
import { Node, SourceFile, SyntaxKind } from 'ts-morph';

import type { Contract, MethodMetadata } from '../types';

export class Scanner {
    constructor(private generatedFile: SourceFile) {}

    public scan(): Contract {
        const exports = this.generatedFile.getExportedDeclarations();

        console.log(`DEBUG SCANNER: File exports:`, Array.from(exports.keys()));

        // 1. Сервисы: экспорты с суффиксом "Service"
        const services: Record<string, MethodMetadata[]> = {};
        exports.forEach((declarations, name) => {
            if (name.endsWith('Service')) {
                // Объединяем методы из всех деклараций с одним именем (может быть несколько)
                const methods: MethodMetadata[] = [];
                declarations.forEach(decl => {
                    methods.push(...this.extractMethodsFromDeclaration(decl));
                });
                // Если уже были методы от предыдущих итераций (для этого имени), объединяем
                services[name] = [...(services[name] || []), ...methods];
            }
        });

        // 2. Модели: типы и интерфейсы контракта (исключая сервисы и схемы)
        const models: string[] = [];
        exports.forEach((declarations, name) => {
            if (name.endsWith('Service') || name.endsWith('Schema')) return;
            if (name === 'createClient') return;
            if (declarations.some(decl => Node.isTypeAliasDeclaration(decl) || Node.isInterfaceDeclaration(decl) || Node.isClassDeclaration(decl))) {
                models.push(name);
            }
        });

        // 3. Схемы: все экспорты с суффиксом Schema
        const schemas = this.extractSchemas(exports);

        console.log(`DEBUG SCANNER: Services found: ${Object.keys(services).length}`);
        console.log(`DEBUG SCANNER: Models found (types/interfaces/classes): ${models.length}`);
        console.log(`DEBUG SCANNER: Schemas found: ${schemas.length}`);

        return {
            services,
            schemas,
            models,
            sourceFile: this.generatedFile,
        };
    }

    private extractMethodsFromDeclaration(decl: ExportedDeclarations): MethodMetadata[] {
        const methods: MethodMetadata[] = [];

        // Сценарий А: Сервис объявлен как переменная с объектным литералом
        if (Node.isVariableDeclaration(decl)) {
            const init = decl.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
            if (init) {
                init.getProperties().forEach(prop => {
                    // Обрабатываем обычные свойства
                    if (Node.isPropertyAssignment(prop)) {
                        const initializer = prop.getInitializer();
                        if (initializer) {
                            const method = this.parseMethod(prop.getName(), initializer);
                            if (method) methods.push(method);
                        }
                    }
                    // Обрабатываем короткую запись свойств (shorthand)
                    else if (Node.isShorthandPropertyAssignment(prop)) {
                        const method = this.parseMethod(
                            prop.getName(),
                            prop // у shorthand-свойства сам узел является функцией? Нужно взять значение
                        );
                        // Однако у ShorthandPropertyAssignment значение — это ссылка на переменную,
                        // поэтому для получения типа нужно использовать nameNode или сам prop.
                        // В ts-morph getType() на ShorthandPropertyAssignment даст тип функции, если она там.
                        // Передадим весь prop как узел, parseMethod его использует.
                        if (method) methods.push(method);
                    }
                });
            }
        }
        // Сценарий Б: Сервис объявлен как класс
        else if (Node.isClassDeclaration(decl)) {
            decl.getMethods().forEach(method => {
                const parsed = this.parseMethod(method.getName(), method);
                if (parsed) methods.push(parsed);
            });
        }

        return methods;
    }

    /**
     * Разбирает метод и возвращает его метаданные.
     * Возвращает null, если узел не является функцией (нет call-сигнатур).
     */
    private parseMethod(name: string, node: Node): MethodMetadata | null {
        const type = node.getType();
        const signatures = type.getCallSignatures();

        // Если сигнатур нет, это не метод (например, свойство-константа) — пропускаем
        if (signatures.length === 0) return null;

        // У сгенерированного API обычно одна сигнатура
        const sig = signatures[0];

        return {
            name,
            params:
                sig?.getParameters().map(p => ({
                    name: p.getName(),
                    isOptional: p.isOptional(),
                    type: p.getTypeAtLocation(node).getText(),
                })) || [],
            returnType: sig?.getReturnType().getText() || 'void',
        };
    }

    private extractSchemas(exports: ReadonlyMap<string, ExportedDeclarations[]>): string[] {
        return [...exports.keys()].filter(name => name.endsWith('Schema'));
    }
}
