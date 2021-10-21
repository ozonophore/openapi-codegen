import type { Service } from '../client/interfaces/Service';
import { postProcessServiceImports } from './postProcessServiceImports';
import { postProcessServiceOperations } from './postProcessServiceOperations';
import { unique } from './unique';

export function postProcessService(service: Service): Service {
    const clone = { ...service };
    clone.operations = postProcessServiceOperations(clone);
    clone.operations.forEach(operation => {
        clone.imports.push(...operation.imports);
    });
    clone.imports = clone.imports.filter(unique);
    clone.imports = postProcessServiceImports(clone);
    return clone;
}
