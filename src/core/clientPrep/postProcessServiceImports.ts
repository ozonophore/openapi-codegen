import { Import } from '../types/shared/Import.model';
import type { Service } from '../types/shared/Service.model';
import { sort } from '../utils/sort';
import { unique } from '../utils/unique';

/**
 * Set unique imports, sorted by name
 * @param service
 */
export function postProcessServiceImports(service: Service): Import[] {
    return service.imports.filter(unique).sort(sort);
}
