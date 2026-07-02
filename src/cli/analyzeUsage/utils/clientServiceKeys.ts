import { type FunctionDeclaration, Node, type SourceFile, SyntaxKind } from 'ts-morph';

/** Extracts createClient return property keys mapped to service class names from generated API sources. */
export function extractClientServiceKeys(sourceFile: SourceFile): Record<string, string> {
    const createClientFn = findCreateClientImplementation(sourceFile);
    if (!createClientFn) {
        return {};
    }

    const body = createClientFn.getBody();
    if (!body || !Node.isBlock(body)) {
        return {};
    }

    const map: Record<string, string> = {};
    for (const returnStmt of body.getDescendantsOfKind(SyntaxKind.ReturnStatement)) {
        const expression = returnStmt.getExpression();
        if (!expression || !Node.isObjectLiteralExpression(expression)) {
            continue;
        }

        for (const prop of expression.getProperties()) {
            if (!Node.isPropertyAssignment(prop)) {
                continue;
            }

            const key = prop.getName();
            const initializer = prop.getInitializer();
            if (!initializer || !Node.isNewExpression(initializer)) {
                continue;
            }

            const classExpr = initializer.getExpression();
            if (Node.isIdentifier(classExpr)) {
                map[key] = classExpr.getText();
            }
        }
    }

    return map;
}

function resolveFunctionDeclaration(decl: Node): FunctionDeclaration | undefined {
    if (Node.isFunctionDeclaration(decl)) {
        return decl;
    }

    if (Node.isExportSpecifier(decl)) {
        const symbol = decl.getSymbol();
        const aliased = symbol?.getAliasedSymbol();
        const declarations = aliased?.getDeclarations() ?? symbol?.getDeclarations() ?? [];
        for (const resolvedDecl of declarations) {
            if (Node.isFunctionDeclaration(resolvedDecl)) {
                return resolvedDecl;
            }
        }
    }

    return undefined;
}

function findCreateClientImplementation(sourceFile: SourceFile): FunctionDeclaration | undefined {
    const exported = sourceFile.getExportedDeclarations().get('createClient');
    if (!exported) {
        return undefined;
    }

    for (const decl of exported) {
        const resolved = resolveFunctionDeclaration(decl);
        if (resolved) {
            return resolved;
        }
    }

    return undefined;
}
