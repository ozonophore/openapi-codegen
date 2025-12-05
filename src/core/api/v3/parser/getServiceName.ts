import { getClassName } from "../../../utils/getClassName";
import { getServiceClassName } from "../../../utils/getServiceClassName";
import { OpenApiOperation } from "../types/OpenApiOperation.model";

export function getServiceName(op: OpenApiOperation, fileName: string): string {
    return getServiceClassName(op.tags?.[0] || `${getClassName(fileName)}Service`);
}