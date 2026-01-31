import { z } from 'zod';

export type CompatibilityIssue = { type: 'removed'; key: string } | { type: 'added'; key: string } | { type: 'type-changed'; key: string } | { type: 'optional-to-required'; key: string };

export function compareShapes(prev: z.ZodObject<any>, next: z.ZodObject<any>): CompatibilityIssue[] {
    const prevShape = prev.shape;
    const nextShape = next.shape;

    const issues: CompatibilityIssue[] = [];

    // removed / changed / optional → required
    for (const key of Object.keys(prevShape)) {
        if (!(key in nextShape)) {
            issues.push({ type: 'removed', key });
            continue;
        }

        const prevField = prevShape[key];
        const nextField = nextShape[key];

        if (prevField._def.typeName !== nextField._def.typeName) {
            issues.push({ type: 'type-changed', key });
        }

        if (prevField.isOptional() && !nextField.isOptional()) {
            issues.push({ type: 'optional-to-required', key });
        }
    }

    // added
    for (const key of Object.keys(nextShape)) {
        if (!(key in prevShape)) {
            issues.push({ type: 'added', key });
        }
    }

    return issues;
}
