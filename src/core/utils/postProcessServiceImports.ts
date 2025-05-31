import type { Service } from '../client/interfaces/Service';
import { sort } from './sort';
import { unique } from './unique';
import { Import } from "../client/interfaces/Import";

/**
 * Set unique imports, sorted by name
 * @param service
 */
export function postProcessServiceImports(service: Service): Import[] {
    return service.imports
        .filter(unique)
        .sort(sort)
        .filter(item => service.name !== item.name);
}
