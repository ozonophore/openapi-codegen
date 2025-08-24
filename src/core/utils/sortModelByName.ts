import { ExportedModel } from "../types/base/ExportedModel.model";

export function sortModelByName(a: ExportedModel, b: ExportedModel): number {
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    return 0;
}