import type { Operation } from '../types/shared/Operation.model';
import type { Service } from '../types/shared/Service.model';
import { flatMap } from './flatMap';

export function postProcessServiceOperations(service: Service): Operation[] {
    const names = new Map<string, number>();

    return service.operations.map(operation => {
        const clone = { ...operation };

        // Parse the service parameters and results, very similar to how we parse
        // properties of models. These methods will extend the type if needed.
        clone.imports.push(
            ...flatMap(clone.parameters, parameter =>
                parameter.imports.map(item => {
                    const imprts = service.imports.filter(serviceImport => serviceImport.path === item.path);
                    return imprts[0];
                })
            )
        );
        clone.imports.push(
            ...flatMap(clone.results, result =>
                result.imports.map(item => {
                    const imprts = service.imports.filter(serviceImport => serviceImport.path === item.path);
                    return imprts[0];
                })
            )
        );

        // Check if the operation name is unique, if not then prefix this with a number
        const name = clone.name;
        const index = names.get(name) || 0;
        if (index > 0) {
            clone.name = `${name}${index}`;
        }
        names.set(name, index + 1);

        return clone;
    });
}
