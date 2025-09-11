import { IModel } from "./writeClientFullIndex";

export function sortModelByName(a: IModel, b: IModel): number {
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    return 0;
}