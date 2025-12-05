import { statSync } from "fs";

import { normalize } from "./pathHelpers";

export function isDirectory(path: string): boolean {
    try {
        return statSync(normalize(path)).isDirectory();
    } catch {
        return false;
    }
}
