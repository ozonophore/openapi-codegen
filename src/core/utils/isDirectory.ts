import { statSync } from "fs";

import { normalizeHelper } from "../../common/utils/pathHelpers";

export function isDirectory(path: string): boolean {
    try {
        return statSync(normalizeHelper(path)).isDirectory();
    } catch {
        return false;
    }
}
