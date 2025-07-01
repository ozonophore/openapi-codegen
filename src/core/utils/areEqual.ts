import { Model } from "../types/shared/Model.model";

export function areEqual(a: Model, b: Model): boolean {
    const equal = a.type === b.type && a.base === b.base && a.template === b.template;
    if (equal && a.link && b.link) {
        return areEqual(a.link, b.link);
    }
    return equal;
}