import { REGEX_BACKSLASH } from "../types/Consts";

export function replaceString(value?: string): string | null | undefined {
    if (!value) {
        return value;
    }
    const searchRegExp = REGEX_BACKSLASH;
    return value.replace(searchRegExp, '/');
}
