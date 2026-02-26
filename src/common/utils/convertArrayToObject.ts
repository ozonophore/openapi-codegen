export function convertArrayToObject(optionsArr: Record<string, any> | Record<string, any>[] | null): Record<string, any> {
    const emptyResult = {
        items: [],
        excludeCoreServiceFiles: undefined,
        request: undefined,
        customExecutorPath: undefined,
        useOptions: undefined,
        useCancelableRequest: undefined,
    };

    if (!optionsArr) {
        return emptyResult;
    }

    if (Array.isArray(optionsArr)) {
        if (optionsArr.length === 0) {
            return emptyResult;
        }

        const rootDrivenFields = [
            'httpClient',
            'useOptions',
            'useUnionTypes',
            'excludeCoreServiceFiles',
            'includeSchemasFiles',
            'interfacePrefix',
            'enumPrefix',
            'typePrefix',
            'useCancelableRequest',
            'logLevel',
            'logTarget',
            'sortByRequired',
            'useSeparatedIndexes',
            'validationLibrary',
            'emptySchemaStrategy',
        ];

        const getNormalizedFieldValue = (item: Record<string, any>, field: string): any => {
            if (field === 'httpClient') {
                return item.httpClient ?? item.client;
            }
            return item[field];
        };

        const getRootValueOrThrow = (field: string): any => {
            const definedValues = optionsArr
                .map(item => getNormalizedFieldValue(item, field))
                .filter(value => value !== undefined);

            if (definedValues.length === 0) {
                return undefined;
            }

            const firstValue = definedValues[0];
            const hasConflict = definedValues.some(value => value !== firstValue);

            if (hasConflict) {
                throw new Error(
                    `Legacy array config has conflicting "${field}" values. ` +
                    `This option must have the same value for all array items.`
                );
            }

            return firstValue;
        };

        const getCommonOptionalRootValue = (field: 'request' | 'customExecutorPath'): any => {
            const definedValues = optionsArr
                .map(item => item[field])
                .filter(value => value !== undefined);

            if (definedValues.length === 0) {
                return undefined;
            }

            const firstValue = definedValues[0];
            const hasConflict = definedValues.some(value => value !== firstValue);

            return hasConflict ? undefined : firstValue;
        };

        const items = optionsArr.map(item => ({
            input: item.input,
            output: item.output,
            outputCore: item.outputCore,
            outputServices: item.outputServices,
            outputModels: item.outputModels,
            outputSchemas: item.outputSchemas,
            request: item.request,
            customExecutorPath: item.customExecutorPath,
        }));

        const extractedRootFields = rootDrivenFields.reduce(
            (acc, field) => ({
                ...acc,
                [field]: getRootValueOrThrow(field),
            }),
            {}
        );

        return {
            ...extractedRootFields,
            request: getCommonOptionalRootValue('request'),
            customExecutorPath: getCommonOptionalRootValue('customExecutorPath'),
            items,
        };
    }

    return optionsArr;
}
