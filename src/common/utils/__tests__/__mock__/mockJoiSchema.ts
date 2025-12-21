export const mockJoiSchema = (keys: string[], isValid: boolean, errors: { path: string; type: string }[] = [], isArray = false) => ({
    validate: (input: any, options: any) => ({
        error: isValid ? null : { details: errors },
        value: input,
    }),
    describe: () => ({
        keys: isArray ? undefined : keys.reduce((acc, key) => ({ ...acc, [key]: {} }), {}),
        items: isArray ? [{}] : undefined,
    }),
});
