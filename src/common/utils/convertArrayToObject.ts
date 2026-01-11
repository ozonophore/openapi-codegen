export function convertArrayToObject(optionsArr: Record<string, any> | Record<string, any>[] | null): Record<string, any> {
    const emptyResult = {
        items: [],
        excludeCoreServiceFiles: undefined,
        request: undefined,
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
        const items = optionsArr.map(item => ({
            input: item.input,
            output: item.output,
            outputCore: item.outputCore,
            outputServices: item.outputServices,
            outputModels: item.outputModels,
            outputSchemas: item.outputSchemas,
        }));

        const firstItem = optionsArr[0];
        // TODO: надо как-то регламентировать, какие поля тут могут и должны быть указаны! И стоит ли их обновлять!
        const fieldsToExtract = [
            'httpClient',
            'useOptions',
            'useUnionTypes',
            'excludeCoreServiceFiles',
            'request',
            'interfacePrefix',
            'enumPrefix',
            'typePrefix',
            'useCancelableRequest',
            'logLevel',
            'logTarget',
            'sortByRequired',
            'useSeparatedIndexes',
            'validationLibrary',
        ];

        const extractedFields = fieldsToExtract.reduce(
            (acc, field) => ({
                ...acc,
                [field]: firstItem[field],
            }),
            {}
        );

        return {
            ...extractedFields,
            items,
        };
    }

    return optionsArr;
}
