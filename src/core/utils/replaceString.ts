import { SEARCH_REGEXP } from "../types/Consts";

export function replaceString(value?: string): string | null | undefined {
    if (!value) {
        return value;
    }
    const searchRegExp = SEARCH_REGEXP;
    return value.replace(searchRegExp, '/');
}
